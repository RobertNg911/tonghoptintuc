const HOT_KEYWORDS = [
  'AI', 'GPT', 'OpenAI', 'Google', 'Apple', 'Meta', 'Microsoft',
  'iPhone', 'Samsung', 'Tesla', 'Trump', 'Putin', 'Biden',
  'Nvidia', 'chip', 'Semicon', ' tariffs', 'trade war',
  'Bitcoin', 'Crypto', 'USD', 'Fed', 'interest rate'
];

// Source reliability weights (CORE-01b)
const SOURCE_RELIABILITY = {
  // Tier 1: High Reliability (+15)
  'Reuters': 15,
  'Reuters (Google RSS)': 15,
  'AP News': 15,
  'AP News (Google RSS)': 15,
  'Bloomberg Markets': 15,
  'Bloomberg Technology': 15,

  // Tier 2: Major Outlets (+10)
  'BBC World': 10,
  'BBC': 10,
  'NYTimes': 10,
  'The New York Times': 10,
  'Guardian World': 10,
  'The Guardian': 10,
  'WSJ': 10,
  'WSJ (Google RSS)': 10,
  'Washington Post': 10,

  // Tier 3: Standard (+5)
  'CNN World': 5,
  'CNN': 5,
  'Al Jazeera': 5,
  'TechCrunch': 5,
  'The Verge': 5,
  'Wired': 5,
  'Ars Technica': 5,
  'Reddit r/worldnews': 5,
  'Reddit r/technology': 5,
  'Reddit r/news': 5,
  'France24': 5,
  'Euronews': 5,
  'CBS News': 5,
  'Fox News': 5,

  // Tier 4: Others (0 - default)
};

const TOPIC_KEYWORDS = {
  tech: ['AI', 'GPT', 'tech', 'software', 'app', 'phone', 'computer'],
  world: ['trump', 'putin', 'biden', 'war', 'military', 'politics'],
  business: ['stock', 'market', 'economy', 'fed', 'rate', 'crypto'],
  science: ['space', 'NASA', 'research', 'climate', 'energy']
};

function scoreItem(item) {
  let score = 0;

  const titleLower = item.title?.toLowerCase() || '';
  const summaryLower = item.summary?.toLowerCase() || '';

  for (const kw of HOT_KEYWORDS) {
    if (titleLower.includes(kw.toLowerCase())) {
      score += 10;
    }
    if (summaryLower.includes(kw.toLowerCase())) {
      score += 5;
    }
  }

  let topicCount = 0;
  for (const keywords of Object.values(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        topicCount++;
      }
    }
  }
  score += Math.min(topicCount * 5, 30);

  if (item.summary?.length > 100) score += 5;
  if (/\d+/.test(titleLower)) score += 5;

  // Source reliability weight (CORE-01b)
  const sourceWeight = SOURCE_RELIABILITY[item.source] || 0;
  score += sourceWeight;

  // Reddit-specific scoring (REDDIT-02 integration)
  if (item.category === 'reddit') {
    // Reddit upvotes (score field) - normalize to reasonable range
    // A post with 50k upvotes shouldn't dominate, so use log scale
    const redditScore = item.score || 0;
    if (redditScore > 0) {
      score += Math.min(Math.log10(redditScore) * 10, 30); // Max 30 points from upvotes
    }

    // Comment engagement bonus
    const comments = item.numComments || 0;
    if (comments > 100) score += 10;
    else if (comments > 50) score += 5;

    // Subreddit-specific bonuses
    if (item.subreddit === 'worldnews') score += 5;
    if (item.subreddit === 'technology') score += 5;
  }

  return score;
}

function scoreAll(items) {
  return items.map(item => ({
    ...item,
    hotScore: scoreItem(item)
  }));
}

module.exports = { scoreItem, scoreAll, HOT_KEYWORDS, TOPIC_KEYWORDS };