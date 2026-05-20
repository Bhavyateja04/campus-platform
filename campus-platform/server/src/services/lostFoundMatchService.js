const LostItem = require("../models/LostModel");
const { compareImagesByUrl } = require("./aiIntegrationService");

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "near",
  "item",
  "lost",
  "found",
  "report",
  "reporting",
  "my",
  "your",
  "this",
  "that",
  "a",
  "an",
  "was",
  "is",
  "has",
  "have",
  "had",
  "in",
  "on",
  "at",
  "of",
  "to",
  "by",
  "it",
]);

const tokenize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part && part.length > 2 && !STOPWORDS.has(part));

const buildTokenSet = (item) => {
  const fields = [item.itemName, item.description, item.location, item.status];
  return new Set(fields.flatMap(tokenize));
};

const similarityScore = (source, candidate) => {
  const sourceTokens = buildTokenSet(source);
  const candidateTokens = buildTokenSet(candidate);
  if (!sourceTokens.size || !candidateTokens.size) return 0;

  let overlap = 0;
  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) overlap += 1;
  }

  const union = new Set([...sourceTokens, ...candidateTokens]).size;
  const base = union === 0 ? 0 : overlap / union;
  const sameStatusBoost =
    source.status && candidate.status && source.status !== candidate.status
      ? 0.08
      : 0;
  const sameLeadTokenBoost =
    tokenize(source.itemName)[0] &&
    tokenize(candidate.itemName)[0] &&
    tokenize(source.itemName)[0] === tokenize(candidate.itemName)[0]
      ? 0.12
      : 0;

  return Math.min(1, base * 1.8 + sameStatusBoost + sameLeadTokenBoost);
};

const extractTopics = (source, candidate) => {
  const sourceTokens = buildTokenSet(source);
  const candidateTokens = buildTokenSet(candidate);
  return [...sourceTokens]
    .filter((token) => candidateTokens.has(token))
    .slice(0, 4);
};

const summarizeMatch = (similarity) => {
  if (similarity >= 0.75) return "Very strong match";
  if (similarity >= 0.5) return "Likely match";
  if (similarity >= 0.3) return "Possible match";
  return "Low confidence match";
};

async function findLostFoundMatches(item, limit = 3) {
  const targetStatus = item.status === "found" ? "lost" : "found";
  const candidates = await LostItem.find({
    _id: { $ne: item._id },
    status: targetStatus,
  }).lean();
  // Compute text similarity synchronously and schedule image comparisons
  const enriched = await Promise.all(
    candidates.map(async (candidate) => {
      const textSim = similarityScore(item, candidate);
      let imageSimPct = null;
      try {
        if (item.imageUrl && candidate.imageUrl) {
          const cmp = await compareImagesByUrl(
            item.imageUrl,
            candidate.imageUrl,
          );
          if (cmp && typeof cmp.similarityPercentage === "number") {
            imageSimPct = Number(cmp.similarityPercentage);
          }
        }
      } catch (e) {
        // ignore image compare failures
      }

      // Combine text + image similarity (weights: text 60%, image 40%)
      const textScore = textSim;
      const imageScore = imageSimPct != null ? imageSimPct / 100 : 0;
      const combined = Math.min(1, textScore * 0.6 + imageScore * 0.4);

      return {
        id: String(candidate._id),
        itemName: candidate.itemName,
        location: candidate.location || "Unknown",
        status: candidate.status,
        similarity: Math.round(combined * 100),
        topics: extractTopics(item, candidate),
        summary: summarizeMatch(combined),
        imageSimilarityPercentage: imageSimPct,
      };
    }),
  );

  return enriched
    .filter((candidate) => candidate.similarity > 10)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function summarizeMatches(matches = []) {
  if (!matches.length) return "";

  const top = matches[0];
  const suffix = matches.length > 1 ? ` and ${matches.length - 1} more` : "";
  return `${top.itemName} looks like a ${top.similarity}% match${suffix}.`;
}

module.exports = {
  findLostFoundMatches,
  summarizeMatches,
};
