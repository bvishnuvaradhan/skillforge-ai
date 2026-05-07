const axios = require("axios");

/**
 * Fetches LeetCode user data using their public GraphQL API.
 */
async function fetchLeetcodeData(username, userAgent) {
  const url = "https://leetcode.com/graphql";
  
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        githubUrl
        contributions {
          points
          questionCount
          testcaseCount
        }
        profile {
          realName
          websites
          countryName
          skillTags
          reputation
          ranking
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
    }
  `;

  try {
    const response = await axios.post(url, {
      query,
      variables: { username }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error fetching LeetCode data for ${username}:`, error.message);
    throw error;
  }
}

/**
 * Fetches recent submissions for a user.
 */
async function fetchLeetcodeSubmissions(username, userAgent) {
  const url = "https://leetcode.com/graphql";
  
  const query = `
    query getRecentSubmissions($username: String!) {
      recentSubmissionList(username: $username, limit: 20) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  try {
    const response = await axios.post(url, {
      query,
      variables: { username }
    }, {
      headers: {
        'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data.data.recentSubmissionList;
  } catch (error) {
    console.error(`Error fetching LeetCode submissions for ${username}:`, error.message);
    return [];
  }
}

/**
 * Normalizes LeetCode data.
 */
function normalizeLeetcodeData(data) {
  const { matchedUser, userContestRanking } = data;
  
  const solvedStats = matchedUser.submitStats.acSubmissionNum;
  const easy = solvedStats.find(s => s.difficulty === 'Easy')?.count || 0;
  const medium = solvedStats.find(s => s.difficulty === 'Medium')?.count || 0;
  const hard = solvedStats.find(s => s.difficulty === 'Hard')?.count || 0;

  return {
    username: matchedUser.username,
    ranking: matchedUser.profile.ranking,
    rating: userContestRanking?.rating || 0,
    totalSolved: matchedUser.submitStats.acSubmissionNum[0].count,
    difficultyBreakdown: { easy, medium, hard },
    reputation: matchedUser.profile.reputation
  };
}

module.exports = {
  fetchLeetcodeData,
  fetchLeetcodeSubmissions,
  normalizeLeetcodeData
};
