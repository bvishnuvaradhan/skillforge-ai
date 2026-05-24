const BANNED_WORDS = [
  "required",
  "must",
  "mandatory",
  "weak",
  "poor",
  "deficient",
  "failed",
  "wrong",
  "incorrect foundation",
  "optimal path"
];

const SAFE_TEMPLATES = {
  manyLearners: "Many learners with similar foundations succeed here.",
  optionalPrep: "Optional preparation may improve retention before this topic.",
  commonPath: "Common successful path (alternatives exist).",
  uncertainty: "This is probabilistic guidance, not a guarantee."
};

function containsBannedWords(text) {
  const normalized = String(text || "").toLowerCase();
  return BANNED_WORDS.some((word) => normalized.includes(word));
}

function enforceSoftLanguage(text, fallback = SAFE_TEMPLATES.optionalPrep) {
  if (!containsBannedWords(text)) return String(text || "");
  return fallback;
}

function buildSoftRecommendation(topic, prerequisite) {
  return enforceSoftLanguage(
    `Common successful path: strengthen ${prerequisite} before ${topic}. Many learners follow this, and alternatives can also work.`,
    SAFE_TEMPLATES.commonPath
  );
}

module.exports = {
  BANNED_WORDS,
  SAFE_TEMPLATES,
  containsBannedWords,
  enforceSoftLanguage,
  buildSoftRecommendation
};
