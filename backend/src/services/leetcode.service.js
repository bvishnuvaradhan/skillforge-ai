const axios = require("axios");
const { normalizeToUDI } = require("../constants/udi");

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
 * Fetches recent submissions for a user with difficulty info.
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
    
    const submissions = response.data.data.recentSubmissionList;

    // To get difficulty, we would ideally need a separate query per problem,
    // but for now, we'll use a heuristic or a batch query if possible.
    // Let's use a simpler batch approach for the titles to guess topics.
    return submissions;
  } catch (error) {
    console.error(`Error fetching LeetCode submissions for ${username}:`, error.message);
    return [];
  }
}

/**
 * Normalizes LeetCode data and submissions.
 * Now maps common patterns to UDI scores.
 */
function normalizeLeetcodeData(data, rawSubmissions = []) {
  const { matchedUser, userContestRanking } = data;
  
  const solvedStats = matchedUser.submitStats.acSubmissionNum;
  const easy = solvedStats.find(s => s.difficulty === 'Easy')?.count || 0;
  const medium = solvedStats.find(s => s.difficulty === 'Medium')?.count || 0;
  const hard = solvedStats.find(s => s.difficulty === 'Hard')?.count || 0;

  // Map raw submissions to internal Submission model
  const submissions = rawSubmissions.map(sub => {
    // Heuristic: Harder sounding words or patterns often correlate to higher UDI
    let udi = 5;
    if (sub.title.toLowerCase().includes('hard') || sub.title.toLowerCase().includes('maximize') || sub.title.toLowerCase().includes('minimum')) {
        udi = 7;
    }

    // Try to guess topics from title
    const topics = ['General'];
    if (sub.title.toLowerCase().includes('sum') || sub.title.toLowerCase().includes('integer')) topics.push('Math');
    if (sub.title.toLowerCase().includes('string') || sub.title.toLowerCase().includes('character')) topics.push('Strings');
    if (sub.title.toLowerCase().includes('index') || sub.title.toLowerCase().includes('array')) topics.push('Arrays');

    return {
      externalId: sub.titleSlug + '-' + sub.timestamp,
      problemName: sub.title,
      platform: 'leetcode',
      status: sub.statusDisplay === 'Accepted' ? 'accepted' : 'failed',
      language: sub.lang,
      solvedAt: new Date(parseInt(sub.timestamp) * 1000),
      udi,
      topics
    };
  });

  return {
    username: matchedUser.username,
    globalRank: matchedUser.profile.ranking,
    rating: Math.round(userContestRanking?.rating || 0),
    totalSolved: matchedUser.submitStats.acSubmissionNum[0].count,
    difficultyBreakdown: { easy, medium, hard },
    reputation: matchedUser.profile.reputation,
    submissions
  };
}

module.exports = {
  fetchLeetcodeData,
  fetchLeetcodeSubmissions,
  normalizeLeetcodeData
};
