const axios = require("axios");
const cheerio = require("cheerio");
const { ScrapingCacheModel } = require("../models/ScrapingCache");

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Scrapes CodeChef profile data with cache fallback and monitoring.
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

    let solvedCount = 0;
    const pageText = $("body").text();
    const totalSolvedMatch = pageText.match(/Total Problems Solved:\s*(\d+)/i);

    if (totalSolvedMatch) {
      solvedCount = parseInt(totalSolvedMatch[1]);
    } else {
      const solvedText = $(".problems-solved h3").text();
      const parenMatch = solvedText.match(/\((\d+)\)/);
      solvedCount = parenMatch ? parseInt(parenMatch[1]) : (parseInt(solvedText.match(/\d+/)?.[0]) || 0);
    }

    const stars = $(".rating-star span").length;

    const data = {
      username,
      rating,
      globalRank,
      countryRank,
      solvedCount,
      stars
    };

    // Cache success
    await ScrapingCacheModel.findOneAndUpdate(
      { platform: "codechef", username },
      {
        data,
        lastSuccessfulFetch: new Date(),
        failureCount: 0,
        isStale: false
      },
      { upsert: true }
    );

    console.log(`[CodeChef] Successfully scraped ${username}`);
    return data;
  } catch (error) {
    console.error(`[CodeChef] Scrape failed for ${username}: ${error.message}`);

    // Try cache fallback
    const cached = await ScrapingCacheModel.findOne({ platform: "codechef", username });
    if (cached && cached.data) {
      const age = Date.now() - new Date(cached.lastSuccessfulFetch).getTime();
      console.warn(`[CodeChef] Using cached data (${Math.round(age / 1000 / 60)} min old) for ${username}`);

      // Increment failure count and mark stale if old
      await ScrapingCacheModel.updateOne(
        { platform: "codechef", username },
        {
          $inc: { failureCount: 1 },
          lastFailureMessage: error.message,
          isStale: age > CACHE_MAX_AGE_MS
        }
      );

      // Return cached data with stale flag
      return { ...cached.data, _cached: true, _staleMinutes: Math.round(age / 1000 / 60) };
    }

    throw error;
  }
}

/**
 * Normalizes CodeChef data with cache stale warning.
 */
function normalizeCodechefData(raw) {
  if (raw._cached) {
    console.warn(`[CodeChef] Using cached data (${raw._staleMinutes}min old)`);
  }

  return {
    platform: 'codechef',
    username: raw.username,
    rating: raw.rating,
    globalRank: raw.globalRank,
    totalSolved: raw.solvedCount,
    stars: raw.stars,
    _isCached: raw._cached || false,
    _warning: raw._cached ? `Data is ${raw._staleMinutes}min old due to scrape failure` : null
  };
}

module.exports = {
  fetchCodechefData,
  normalizeCodechefData
};
