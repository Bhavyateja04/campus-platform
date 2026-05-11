// Lightweight content moderation proxy.
// If the local ai-service is reachable, delegate text moderation to it.
// Otherwise, fall back to a small built-in heuristic so client UIs degrade gracefully.

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5050";
const fs = require("fs");

const BAD_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "nigger",
  "faggot",
  "whore",
  "slut",
  "rape",
  "kill yourself",
];

function localTextHeuristic(text) {
  const t = String(text || "").toLowerCase();
  if (!t.trim()) return { safe: true, source: "local", reason: null };
  for (const w of BAD_WORDS) {
    if (t.includes(w)) {
      return {
        safe: false,
        source: "local",
        reason: "Inappropriate language detected.",
      };
    }
  }
  return { safe: true, source: "local", reason: null };
}

async function proxyToAiService(text) {
  // node 18+ has global fetch.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`${AI_SERVICE_URL}/moderate-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function moderateText(req, res) {
  const text = (req.body && req.body.text) || "";
  if (typeof text !== "string") {
    return res
      .status(400)
      .json({ safe: false, reason: "text must be a string" });
  }
  if (text.length > 4000) {
    return res
      .status(400)
      .json({ safe: false, reason: "text too long (max 4000 chars)" });
  }

  const remote = await proxyToAiService(text);
  if (remote && typeof remote.safe === "boolean") {
    return res.json({ ...remote, source: remote.source || "ai-service" });
  }

  return res.json(localTextHeuristic(text));
}

async function proxyToAiMemoryService(text, file) {
  if (!file) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const formData = new FormData();
    formData.append("text", text || "");
    formData.append(
      "image",
      new Blob([file.buffer], { type: file.mimetype || "image/jpeg" }),
      file.originalname || "memory.jpg",
    );

    const res = await fetch(`${AI_SERVICE_URL}/moderate`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function moderateMemory(req, res) {
  const text = String((req.body && req.body.text) || "");
  const remote = await proxyToAiMemoryService(text, req.file);

  if (remote && typeof remote.safe === "boolean") {
    return res.json({ ...remote, source: remote.source || "ai-service" });
  }

  return moderateText(req, res);
}

module.exports = { moderateText, moderateMemory };
