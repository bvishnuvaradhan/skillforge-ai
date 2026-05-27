const { Anthropic } = require("@anthropic-ai/sdk");
const { env } = require("../config/env");

// Initialize Claude client
const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

class MentorAIService {
  constructor() {
    this.model = "claude-3-5-sonnet-20241022"; // Latest Claude model
    this.maxTokens = 1000;
  }

  // Generate mentor response using Claude
  async generateMentorResponse(systemPrompt, userPrompt) {
    try {
      const response = await client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      // Extract text from response
      if (response.content && response.content.length > 0) {
        return response.content[0].text;
      }

      return "I'm unable to generate a response at the moment. Please try again.";
    } catch (error) {
      console.error("Claude API call failed:", error);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  // Generate explanation using Claude
  async generateExplanation(explanationType, context) {
    const systemPrompt = `You are an expert learning mentor explaining ${explanationType}.

Be clear, concise, and educational. Always:
- Communicate confidence level
- Mention any uncertainty or data gaps
- Use concrete examples from the user's learning data
- Avoid generic advice
- Provide alternatives when applicable`;

    const userPrompt = `Generate a ${explanationType} explanation based on this context:
Context: ${JSON.stringify(context, null, 2)}

Keep response under 300 words. Format: start with main point, then add supporting details.`;

    return this.generateMentorResponse(systemPrompt, userPrompt);
  }

  // Generate coaching insight using Claude
  async generateCoachingInsight(learnerProfile, recentActivity) {
    const systemPrompt = `You are a supportive learning coach analyzing learner patterns.

Rules:
- Focus on actionable insights based on actual data
- Never use guilt-inducing language
- Suggest realistic improvements
- Consider learning style and preferences`;

    const userPrompt = `Generate a coaching insight for:
Learner: ${JSON.stringify(learnerProfile, null, 2)}
Recent Activity: ${JSON.stringify(recentActivity, null, 2)}

Format: Type of insight, specific observation, recommendation. Max 200 words.`;

    return this.generateMentorResponse(systemPrompt, userPrompt);
  }

  // Generate reflection using Claude
  async generateReflection(weeklyData) {
    const systemPrompt = `You are a thoughtful learning reflection writer.

Create reflections that:
- Reference specific metrics and numbers
- Highlight concrete achievements
- Identify patterns in learning behavior
- Suggest forward-looking improvements
- Never use generic motivational phrases`;

    const userPrompt = `Generate a weekly learning reflection based on this data:
${JSON.stringify(weeklyData, null, 2)}

Format: Opening summary (1 sentence), key metrics with numbers (3-4 points),
pattern observation, forward-looking suggestion. Max 250 words.`;

    return this.generateMentorResponse(systemPrompt, userPrompt);
  }
}

// Singleton instance
const mentorAIService = new MentorAIService();

module.exports = { mentorAIService, MentorAIService };
