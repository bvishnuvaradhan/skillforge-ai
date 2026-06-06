const { Mistral } = require("@mistralai/mistralai");
const { env } = require("../config/env");
const { getBreaker } = require("../lib/circuit-breaker");

// Initialize circuit breaker for Mistral API calls
const breaker = getBreaker("mistral", { failureThreshold: 3, cooldownPeriodMs: 20000 });

/**
 * Executes a function with exponential backoff retry logic
 */
async function retryWithBackoff(fn, retries = 3, delayMs = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`[MentorAI] API call failed. Retrying in ${delayMs}ms. Attempts remaining: ${retries}. Error:`, error.message);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return retryWithBackoff(fn, retries - 1, delayMs * 2);
  }
}

class MentorAIService {
  constructor() {
    this.model = "mistral-small-latest"; // Free model, excellent for mentoring
    this.maxTokens = 1000;
    this.apiKey = env.MISTRAL_API_KEY;

    if (this.apiKey) {
      this.client = new Mistral({ apiKey: this.apiKey });
    } else {
      console.warn("⚠️  MISTRAL_API_KEY not set. Mentor AI will use mock responses.");
    }
  }

  // Generate mentor response using Mistral wrapped in Circuit Breaker and Retry logic
  async generateMentorResponse(systemPrompt, userPrompt, userId = null, action = "mentor_response") {
    // Fallback to mock if no API key
    if (!this.apiKey || !this.client) {
      return this._generateMockResponse(userPrompt);
    }

    const runApiCall = () =>
      retryWithBackoff(
        async () => {
          const response = await this.client.chat.complete({
            model: this.model,
            messages: [
              {
                role: "user",
                content: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
            maxTokens: this.maxTokens,
          });

          if (response.choices && response.choices.length > 0) {
            const text = response.choices[0].message.content.trim();

            // Log AI token usage and cost asynchronously
            if (response.usage && userId) {
              const { promptTokens = 0, completionTokens = 0, totalTokens = 0 } = response.usage;
              const cost = totalTokens * 0.00000025; // Mistral Small standard rate ($0.25/1M tokens)
              const { AICostLogModel } = require("../models/AICostLog");
              
              AICostLogModel.create({
                userId,
                model: this.model,
                action,
                tokens: {
                  input: promptTokens,
                  output: completionTokens,
                  total: totalTokens
                },
                cost
              }).catch((err) => console.error("[MentorAI] Failed to log AI cost:", err.message));
            }

            if (text && text.length > 0) return text;
          }
          throw new Error("Empty response returned from Mistral model");
        },
        3,
        1000
      );

    const fallbackResponse = (err) => {
      console.warn(`[MentorAI] Circuit breaker fallback triggered. Serving mock explanation. Trigger error:`, err ? err.message : "Breaker open");
      return this._generateMockResponse(userPrompt);
    };

    return breaker.execute(runApiCall, fallbackResponse);
  }

  // Fallback mock response for development
  _generateMockResponse(userPrompt) {
    const mockResponses = [
      "Based on your learning patterns, I notice you're progressing well. Keep focusing on the fundamentals.",
      "Your consistency is impressive! This week you've maintained a strong streak.",
      "I'd recommend taking a short break soon - you've been focused for a while.",
      "Your mastery in this topic is increasing. Consider exploring related concepts.",
      "The data shows you're doing great. Your problem-solving speed is improving.",
    ];
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  // Generate explanation using Claude
  async generateExplanation(explanationType, context, userId = null) {
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

    return this.generateMentorResponse(systemPrompt, userPrompt, userId, "explain");
  }

  // Generate coaching insight using Claude
  async generateCoachingInsight(learnerProfile, recentActivity, userId = null) {
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

    return this.generateMentorResponse(systemPrompt, userPrompt, userId, "insight");
  }

  // Generate reflection using Claude
  async generateReflection(weeklyData, userId = null) {
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

    return this.generateMentorResponse(systemPrompt, userPrompt, userId, "reflection");
  }
}

// Singleton instance
const mentorAIService = new MentorAIService();

module.exports = { mentorAIService, MentorAIService };
