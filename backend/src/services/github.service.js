const { graphql } = require("@octokit/graphql");
const axios = require("axios");
const cheerio = require("cheerio");
const { env } = require("../config/env");

/**
 * Fetches GitHub user data. Uses GraphQL if token is available, 
 * otherwise falls back to a public profile scraper.
 */
async function fetchGithubData(username) {
  console.log(`[GitHubService] Starting fetch for: ${username} (Token present: ${!!env.GITHUB_TOKEN})`);

  if (env.GITHUB_TOKEN) {
    try {
      const githubGraphql = graphql.defaults({
        headers: {
          authorization: `token ${env.GITHUB_TOKEN}`,
        },
      });

      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
            repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC}, privacy: PUBLIC) {
              totalCount
              nodes {
                name
                url
                stargazerCount
                primaryLanguage {
                  name
                }
              }
            }
          }
        }
      `;

      const data = await githubGraphql(query, { username });
      console.log(`[GitHubService] GraphQL success for ${username}`);
      return data.user;
    } catch (error) {
      console.warn(`[GitHubService] GraphQL failed for ${username}: ${error.message}`);
      // Fall through to scraper
    }
  }

  // FALLBACK: Public Profile Scraper
  try {
    console.log(`[GitHubService] Attempting Scraper Fallback for ${username}`);
    const response = await axios.get(`https://github.com/${username}?tab=overview`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Improved scraper: Search multiple potential locations for contributions
    let totalContributions = 0;
    const contributionText = $(".js-yearly-contributions h2, .js-contribution-graph h2").first().text();
    const match = contributionText.match(/([\d,]+)\s+contributions/i);
    if (match) {
      totalContributions = parseInt(match[1].replace(/,/g, ''));
    }

    // Extract repository count
    const repoCountText = $("[data-tab-item='repositories'] .Counter, .UnderlineNav-item span.Counter").first().text();
    const totalRepos = parseInt(repoCountText) || 0;

    console.log(`[GitHubService] Scraper result for ${username}: ${totalContributions} contributions, ${totalRepos} repos`);

    return {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions,
          weeks: []
        }
      },
      repositories: {
        totalCount: totalRepos,
        nodes: []
      }
    };
  } catch (error) {
    console.error(`[GitHubService] All fetch methods failed for ${username}:`, error.message);
    throw error;
  }
}

/**
 * Normalizes GitHub data for internal storage.
 */
function normalizeGithubData(raw) {
  const contributions = raw.contributionsCollection.contributionCalendar;
  
  const repos = (raw.repositories.nodes || []).map(repo => ({
    name: repo.name,
    url: repo.url,
    stars: repo.stargazerCount,
    language: repo.primaryLanguage ? repo.primaryLanguage.name : 'Unknown'
  }));

  const totalStars = repos.reduce((acc, repo) => acc + repo.stars, 0);

  return {
    totalContributions: contributions.totalContributions || 0,
    totalRepos: raw.repositories.totalCount || 0,
    totalStars: totalStars || 0,
    repos,
    topLanguages: [],
    contributionWeeks: contributions.weeks || []
  };
}

module.exports = {
  fetchGithubData,
  normalizeGithubData
};
