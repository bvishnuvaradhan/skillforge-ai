/**
 * Unified Difficulty Index (UDI) Mapping
 * 
 * This system normalizes difficulty levels across different platforms
 * into a single scale of 1 to 10.
 * 
 * 1-2: Easy / Beginner
 * 3-5: Medium / Intermediate
 * 6-8: Hard / Advanced
 * 9-10: Expert / Pro
 */

const UDI_MAP = {
  leetcode: {
    'Easy': 2,
    'Medium': 5,
    'Hard': 8
  },
  codechef: {
    // CodeChef uses rating ranges
    // Range: [Min, Max] -> UDI
    ratings: [
      { min: 0, max: 1000, udi: 1 },
      { min: 1001, max: 1200, udi: 2 },
      { min: 1201, max: 1400, udi: 3 },
      { min: 1401, max: 1600, udi: 4 },
      { min: 1601, max: 1800, udi: 5 },
      { min: 1801, max: 2000, udi: 6 },
      { min: 2001, max: 2200, udi: 7 },
      { min: 2201, max: 2500, udi: 8 },
      { min: 2501, max: 3000, udi: 9 },
      { min: 3001, max: 9999, udi: 10 }
    ]
  },
  github: {
    // GitHub activity is mapped differently (impact/complexity)
    'trivial': 1, // Documentation, formatting
    'minor': 3,   // Small features, bug fixes
    'major': 6,   // Significant features
    'architectural': 9 // New systems, refactors
  }
};

/**
 * Normalizes platform-specific difficulty to UDI
 */
function normalizeToUDI(platform, rawDifficulty) {
  if (platform === 'leetcode') {
    return UDI_MAP.leetcode[rawDifficulty] || 3;
  }
  
  if (platform === 'codechef') {
    const rating = parseInt(rawDifficulty);
    if (isNaN(rating)) return 3;
    const match = UDI_MAP.codechef.ratings.find(r => rating >= r.min && rating <= r.max);
    return match ? match.udi : 3;
  }
  
  return 3; // Default fallback
}

module.exports = {
  UDI_MAP,
  normalizeToUDI
};
