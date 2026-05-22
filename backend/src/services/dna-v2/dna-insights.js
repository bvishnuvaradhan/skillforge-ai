// DNA Insights Generator
// Creates DNA-specific insights for display

async function generateDNAInsights(dnaProfile, transition) {
  try {
    console.log(`[DNA] Generating DNA insights`);

    const insights = [];

    // Insight 1: DNA Profile Card
    const classification = dnaProfile.classification;
    const blend = classification.blend;
    const blendString = Object.entries(blend)
      .filter(([_, pct]) => pct > 0.1)
      .map(([type, pct]) => `${Math.round(pct * 100)}% ${type}`)
      .join(" + ");

    const profileInsight = {
      type: "dna_profile",
      message: `Strong indication of ${classification.primaryType} traits`,
      description: blendString || classification.primaryType,
      confidence: {
        score: classification.confidence,
        reasoning: `Based on ${dnaProfile.metadata.submissionCount} submissions over ${dnaProfile.metadata.observationDays} days`
      },
      evidence: {
        dataSources: [
          `Consistency: ${dnaProfile.factors.consistency}% active days`,
          `Submission frequency: ${dnaProfile.factors.frequency}% (${Math.round(dnaProfile.factors.frequency / 10)}/week)`,
          `Topic depth: ${dnaProfile.factors.topicDepth}% (focused study)`,
          `Difficulty progression: ${dnaProfile.factors.difficultyProgression}% (seeking challenge)`
        ]
      },
      caveats: {
        notes: [
          "Learning profiles are behavioral classifications based on patterns, not fixed identities",
          "Your profile can shift as your learning strategy evolves",
          "Profiles are most reliable after 20+ days and 20+ submissions"
        ]
      }
    };

    insights.push(profileInsight);

    // Insight 2: DNA Transition Alert (if detected)
    if (transition && transition.transitionConfidence > 70) {
      const transitionInsight = {
        type: "dna_transition",
        message: `Transition detected: Moving from ${transition.fromType} to ${transition.toType}`,
        confidence: {
          score: transition.transitionConfidence,
          reasoning: "Sustained pattern change detected"
        },
        evidence: {
          whatChanged: transition.signals || [],
          whatThisMeans: getTransitionMeaning(transition.toType),
          suggestion: getTransitionSuggestion(transition.toType)
        },
        caveats: {
          notes: [
            "Profile transitions indicate genuine shifts in learning approach",
            "These changes often reflect your growing expertise and evolving preferences"
          ]
        }
      };

      insights.push(transitionInsight);
    }

    console.log(`[DNA] Generated ${insights.length} DNA insights`);

    return insights;
  } catch (error) {
    console.error(`[DNA] Error generating insights:`, error);
    return [];
  }
}

function getTransitionMeaning(toType) {
  const meanings = {
    "Consistent Learner": "You're settling into a steady, sustainable learning rhythm with strong consistency",
    "Persistent Explorer": "You're increasingly willing to struggle with difficult problems for deeper understanding",
    "Speed Strategist": "You're solving problems faster and tackling more volume - building momentum",
    "Deep Diver": "You're seeking greater challenge and diving deeper into complex topics"
  };
  return meanings[toType] || "Your learning style is evolving";
}

function getTransitionSuggestion(toType) {
  const suggestions = {
    "Consistent Learner": "Maintain your steady pace - consistency is your strength",
    "Persistent Explorer": "Don't shy away from hard problems; they build the deepest learning",
    "Speed Strategist": "Balance speed with understanding; ensure strong fundamentals",
    "Deep Diver": "Consider tackling advanced topics once you have solid prerequisites"
  };
  return suggestions[toType] || "Continue building on your strengths";
}

module.exports = {
  generateDNAInsights
};
