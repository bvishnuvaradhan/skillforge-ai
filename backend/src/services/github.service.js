const { graphql } = require("@octokit/graphql");
const { env } = require("../config/env");

const githubGraphql = graphql.defaults({
  headers: {
    authorization: `token ${env.GITHUB_TOKEN}`,
  },
});

/**
 * Fetches GitHub user data including contributions, repositories, and languages.
 */
async function fetchGithubData(username) {
  if (!env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          startedAt
          endedAt
        }
        repositories(first: 50, orderBy: {field: STARGAZERS, direction: DESC}, privacy: PUBLIC) {
          nodes {
            name
            url
            stargazerCount
            primaryLanguage {
              name
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await githubGraphql(query, { username });
    return data.user;
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error.message);
    throw error;
  }
}

/**
 * Normalizes GitHub data for internal storage.
 */
function normalizeGithubData(raw) {
  const contributions = raw.contributionsCollection.contributionCalendar;
  
  const repos = raw.repositories.nodes.map(repo => ({
    name: repo.name,
    url: repo.url,
    stars: repo.stargazerCount,
    language: repo.primaryLanguage ? repo.primaryLanguage.name : 'Unknown',
    contributionCount: repo.defaultBranchRef?.target?.history?.totalCount || 0
  }));

  const languageMap = {};
  repos.forEach(repo => {
    if (repo.language !== 'Unknown') {
      languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
    }
  });

  const topLanguages = Object.entries(languageMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalContributions: contributions.totalContributions,
    repos,
    topLanguages,
    contributionWeeks: contributions.weeks
  };
}

module.exports = {
  fetchGithubData,
  normalizeGithubData
};
