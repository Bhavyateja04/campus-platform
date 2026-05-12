const fetch = global.fetch;

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5050";

const analyzeLostItem = async ({ text, imageUrl }) => {
  try {
    // If an imageUrl is provided, fetch the image and forward as multipart to the AI service
    if (imageUrl) {
      const imgResp = await fetch(imageUrl);
      if (!imgResp.ok)
        throw new Error(`Failed to fetch image: ${imgResp.status}`);
      const buffer = await imgResp.arrayBuffer();

      const formData = new FormData();
      formData.append("text", text || "");
      formData.append(
        "image",
        new Blob([buffer], {
          type: imgResp.headers.get("content-type") || "image/jpeg",
        }),
        "lostitem.jpg",
      );

      const resp = await fetch(`${AI_SERVICE_URL}/moderate`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) return null;
      return await resp.json().catch(() => null);
    }

    // Fallback: analyze text-only
    if (text) {
      const resp = await fetch(`${AI_SERVICE_URL}/moderate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!resp.ok) return null;
      return await resp.json().catch(() => null);
    }

    return null;
  } catch (err) {
    console.error(
      "[aiIntegrationService] analyzeLostItem error",
      err.message || err,
    );
    return null;
  }
};

// ----- Comparison / analysis helpers for ai-service2 -----
const AI_SERVICE_TOKEN =
  process.env.AI_SERVICE_TOKEN || process.env.AI_SERVICE_JWT || null;
const API_BASE =
  process.env.AI_COMPARISON_URL ||
  process.env.AI_SERVICE_URL ||
  "http://localhost:5000";

async function uploadImageByUrl(imageUrl) {
  try {
    const resp = await fetch(imageUrl);
    if (!resp.ok)
      throw new Error(`Failed to fetch image ${imageUrl}: ${resp.status}`);
    const buffer = await resp.arrayBuffer();

    const form = new FormData();
    form.append(
      "image",
      new Blob([buffer], {
        type: resp.headers.get("content-type") || "image/jpeg",
      }),
      "file.jpg",
    );

    const uploadResp = await fetch(`${API_BASE}/api/images/upload`, {
      method: "POST",
      body: form,
      headers: AI_SERVICE_TOKEN
        ? { Authorization: `Bearer ${AI_SERVICE_TOKEN}` }
        : undefined,
    });

    if (!uploadResp.ok) {
      const txt = await uploadResp.text().catch(() => "");
      throw new Error(`Upload failed ${uploadResp.status} ${txt}`);
    }

    const body = await uploadResp.json().catch(() => null);
    return body?.data?.analysis?._id || null;
  } catch (err) {
    console.error(
      "[aiIntegrationService] uploadImageByUrl",
      err.message || err,
    );
    return null;
  }
}

async function triggerAnalyze(imageId) {
  try {
    const resp = await fetch(`${API_BASE}/api/images/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(AI_SERVICE_TOKEN
          ? { Authorization: `Bearer ${AI_SERVICE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ imageId }),
    });
    if (!resp.ok) return false;
    return true;
  } catch (err) {
    return false;
  }
}

async function getAnalysis(imageId) {
  try {
    const resp = await fetch(`${API_BASE}/api/images/${imageId}`, {
      headers: AI_SERVICE_TOKEN
        ? { Authorization: `Bearer ${AI_SERVICE_TOKEN}` }
        : undefined,
    });
    if (!resp.ok) return null;
    const body = await resp.json().catch(() => null);
    return body?.data?.analysis || null;
  } catch (err) {
    return null;
  }
}

async function ensureAnalysisForUrl(imageUrl, timeoutMs = 8000) {
  try {
    const imageId = await uploadImageByUrl(imageUrl);
    if (!imageId) return null;
    // trigger analyze (best-effort)
    await triggerAnalyze(imageId);

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const analysis = await getAnalysis(imageId);
      if (analysis && analysis.status === "completed") return analysis;
      await new Promise((r) => setTimeout(r, 900));
    }
    // final attempt
    return await getAnalysis(imageId);
  } catch (err) {
    console.error(
      "[aiIntegrationService] ensureAnalysisForUrl",
      err.message || err,
    );
    return null;
  }
}

async function compareImagesByUrl(urlA, urlB) {
  try {
    const [a, b] = await Promise.all([
      ensureAnalysisForUrl(urlA),
      ensureAnalysisForUrl(urlB),
    ]);
    if (!a || !b) return null;
    const idA = a._id || a.id;
    const idB = b._id || b.id;
    if (!idA || !idB) return null;
    const resp = await fetch(`${API_BASE}/api/compare/${idA}/${idB}`, {
      method: "POST",
      headers: AI_SERVICE_TOKEN
        ? { Authorization: `Bearer ${AI_SERVICE_TOKEN}` }
        : undefined,
    });
    if (!resp.ok) return null;
    const body = await resp.json().catch(() => null);
    return body?.data?.comparison || null;
  } catch (err) {
    console.error(
      "[aiIntegrationService] compareImagesByUrl",
      err.message || err,
    );
    return null;
  }
}

module.exports = {
  analyzeLostItem,
  uploadImageByUrl,
  ensureAnalysisForUrl,
  compareImagesByUrl,
};
