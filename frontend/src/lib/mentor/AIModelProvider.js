// AIModelProvider - Frontend wrapper for Claude API via backend
// Calls /api/mentor/:userId/response endpoint

export function createAIModelProvider(userId, apiBaseUrl) {
  return async (systemPrompt, userPrompt) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/mentor/${userId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI model provider failed:', error);
      throw error;
    }
  };
}

export function createExplanationProvider(userId, apiBaseUrl) {
  return async (explanationType, context) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/mentor/${userId}/explain`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            explanationType,
            context,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.explanation;
    } catch (error) {
      console.error('Explanation provider failed:', error);
      throw error;
    }
  };
}

export function createInsightProvider(userId, apiBaseUrl) {
  return async (learnerProfile, recentActivity) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/mentor/${userId}/insight`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            learnerProfile,
            recentActivity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.insight;
    } catch (error) {
      console.error('Insight provider failed:', error);
      throw error;
    }
  };
}

export function createReflectionProvider(userId, apiBaseUrl) {
  return async (weeklyData) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/mentor/${userId}/reflection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            weeklyData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.reflection;
    } catch (error) {
      console.error('Reflection provider failed:', error);
      throw error;
    }
  };
}
