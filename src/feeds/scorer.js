const HOT_KEYWORDS = [
  'AI', 'GPT', 'OpenAI', 'Google', 'Apple', 'Meta', 'Microsoft',
  'iPhone', 'Samsung', 'Tesla', 'Trump', 'Putin', 'Biden',
  'Nvidia', 'chip', 'Semicon', ' tariffs', 'trade war',
  'Bitcoin', 'Crypto', 'USD', 'Fed', 'interest rate'
];

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
  if (item.source === 'BBC' || item.source === 'Reuters') score += 10;

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