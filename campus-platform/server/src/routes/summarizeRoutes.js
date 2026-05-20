const express = require("express");
const router = express.Router();
const axios = require("axios");

/**
 * POST /api/summarize/placement-experience
 * Summarizes placement experience text using AI service
 * Body: { text: string }
 * Returns: { summary: string }
 */
router.post("/placement-experience", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Text field is required and must be non-empty",
      });
    }

    // Get AI service URL from environment or default
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:5050";

    // Call AI service to summarize
    // The AI service should expose a /summarize endpoint
    try {
      const response = await axios.post(
        `${aiServiceUrl}/summarize`,
        {
          text: text.trim(),
          maxLength: 150, // Target summary length
        },
        {
          timeout: 10000,
        },
      );

      const summary = response.data.summary || response.data.result || null;

      if (!summary) {
        // Fallback: Create a basic summary by taking first 3 sentences
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
        const basicSummary = sentences
          .slice(0, 3)
          .map((s) => s.trim())
          .join(". ");

        return res.status(200).json({
          success: true,
          summary: basicSummary + ".",
          fallback: true,
        });
      }

      return res.status(200).json({
        success: true,
        summary: summary,
      });
    } catch (aiError) {
      console.log(
        "AI Service error, using fallback summarization:",
        aiError.message,
      );

      // Fallback summarization using text processing
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
      const summarized = sentences
        .slice(0, Math.min(3, sentences.length))
        .map((s) => s.trim())
        .join(". ");

      return res.status(200).json({
        success: true,
        summary: summarized + ".",
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({
      success: false,
      message: "Error summarizing text",
      error: error.message,
    });
  }
});

module.exports = router;
