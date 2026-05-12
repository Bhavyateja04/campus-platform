class AssistantService {

  async askCampusAssistant(question) {
    // TODO:
    // Integrate Gemini/OpenAI
    // Add campus context retrieval

    return {
      response: "Future campus AI assistant",
    };
  }
}
router.post("/ask", async (req, res) => {

  const { question } = req.body;

  res.json({
    answer: `AI assistant response for: ${question}`,
  });

});
module.exports = new AssistantService();
