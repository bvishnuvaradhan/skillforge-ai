const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Scrapes CodeChef profile data.
 */
async function fetchCodechefData(username, userAgent) {
  const url = `https://www.codechef.com/users/${username}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    const rating = parseInt($(".rating-number").text()) || 0;
    const globalRank = parseInt($(".rating-ranks strong").first().text()) || 0;
    const countryRank = parseInt($(".rating-ranks strong").last().text()) || 0;
    
    // Problems solved
    const solvedCount = parseInt($(".problems-solved h3").text().match(/\d+/)?.[0]) || 0;
    
    // Star rating (e.g., "5★")
    const stars = $(".rating-star span").length;

    return {
      username,
      rating,
      globalRank,
      countryRank,
      solvedCount,
      stars
    };
  } catch (error) {
    console.error(`Error fetching CodeChef data for ${username}:`, error.message);
    throw error;
  }
}

/**
 * Normalizes CodeChef data.
 */
function normalizeCodechefData(raw) {
  return {
    platform: 'codechef',
    username: raw.username,
    rating: raw.rating,
    globalRank: raw.globalRank,
    totalSolved: raw.solvedCount,
    stars: raw.stars
  };
}

module.exports = {
  fetchCodechefData,
  normalizeCodechefData
};
