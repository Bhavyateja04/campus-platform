// ─── Lightweight Content Moderation Proxy ────────────────────────────────────
// Primary:  delegates to the AI service if reachable.
// Fallback: built-in heuristic so client UIs degrade gracefully.

// ─── Config ───────────────────────────────────────────────────────────────────

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5050";

const MODERATION_CONFIG = {
  TEXT_MAX_LENGTH: 4000,
  TEXT_TIMEOUT_MS: 1500,
  MEMORY_TIMEOUT_MS: 6000,
  DEFAULT_IMAGE_NAME: "memory.jpg",
  DEFAULT_IMAGE_TYPE: "image/jpeg",
};

const ENDPOINTS = {
  MODERATE_TEXT: `${AI_SERVICE_URL}/moderate-text`,
  MODERATE_MEMORY: `${AI_SERVICE_URL}/moderate`,
};

const MESSAGES = {
  TEXT_NOT_STRING: "text must be a string",
  TEXT_TOO_LONG: `text too long (max ${MODERATION_CONFIG.TEXT_MAX_LENGTH} chars)`,
  INAPPROPRIATE_LANGUAGE: "Inappropriate language detected.",
};

// ─── Blocklist ────────────────────────────────────────────────────────────────

const BLOCKED_WORDS = new Set([
  "fuck", "shit", "bitch", "asshole", "bastard",
  "cunt", "dick", "nigger", "faggot", "whore",
  "slut", "rape", "kill yourself",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ safe: false, reason: message });
};

const buildModerationResult = (safe, source, reason = null) => ({
  safe,
  source,
  reason,
});

const createAbortController = (timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timer };
};

const isValidRemoteResult = (result) => {
  return result && typeof result.safe === "boolean";
};

// ─── Local Heuristic ──────────────────────────────────────────────────────────

const runLocalHeuristic = (text) => {
  const normalized = String(text || "").toLowerCase().trim();

  if (!normalized) {
    return buildModerationResult(true, "local");
  }

  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(word)) {
      return buildModerationResult(false, "local", MESSAGES.INAPPROPRIATE_LANGUAGE);
    }
  }

  return buildModerationResult(true, "local");
};

// ─── AI Service Proxies ───────────────────────────────────────────────────────

const proxyTextToAiService = async (text) => {
  const { controller, timer } = createAbortController(MODERATION_CONFIG.TEXT_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINTS.MODERATE_TEXT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) return null;
    return await response.json().catch(() => null);
  } catch {
    clearTimeout(timer);
    return null;
  }
};

const proxyMemoryToAiService = async (text, file) => {
  if (!file) return null;

  const { controller, timer } = createAbortController(MODERATION_CONFIG.MEMORY_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("text", text || "");
    formData.append(
      "image",
      new Blob([file.buffer], { type: file.mimetype || MODERATION_CONFIG.DEFAULT_IMAGE_TYPE }),
      file.originalname || MODERATION_CONFIG.DEFAULT_IMAGE_NAME,
    );

    const response = await fetch(ENDPOINTS.MODERATE_MEMORY, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) return null;
    return await response.json().catch(() => null);
  } catch {
    clearTimeout(timer);
    return null;
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Moderate plain text content
 * @route   POST /api/moderate/text
 * @access  Internal
 */
const moderateText = async (req, res) => {
  const text = (req.body && req.body.text) || "";

  if (typeof text !== "string") {
    return sendError(res, 400, MESSAGES.TEXT_NOT_STRING);
  }

  if (text.length > MODERATION_CONFIG.TEXT_MAX_LENGTH) {
    return sendError(res, 400, MESSAGES.TEXT_TOO_LONG);
  }

  const remoteResult = await proxyTextToAiService(text);

  if (isValidRemoteResult(remoteResult)) {
    return res.json({ ...remoteResult, source: remoteResult.source || "ai-service" });
  }

  return res.json(runLocalHeuristic(text));
};

/**
 * @desc    Moderate memory content (text + image)
 * @route   POST /api/moderate/memory
 * @access  Internal
 */
const moderateMemory = async (req, res) => {
  const text = String((req.body && req.body.text) || "");

  const remoteResult = await proxyMemoryToAiService(text, req.file);

  if (isValidRemoteResult(remoteResult)) {
    return res.json({ ...remoteResult, source: remoteResult.source || "ai-service" });
  }

  return moderateText(req, res);
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { moderateText, moderateMemory };
