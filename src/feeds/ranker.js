const DEFAULT_TOP = 5;
const MIN_SCORE = 20;

function rankNews(scoredItems, options = {}) {
  const top = options.top || DEFAULT_TOP;
  const minScore = options.minScore || MIN_SCORE;

  const sorted = scoredItems
    .filter(i => i.hotScore >= minScore)
    .sort((a, b) => b.hotScore - a.hotScore);

  return sorted.slice(0, top);
}

function getHotNews(items, options = {}) {
  const top = options.top || DEFAULT_TOP;

  const scored = items.map(item => ({
    ...item,
    hotScore: calculateScore(item)
  }));

  return rankNews(scored, { top });
}

function calculateScore(item) {
  let score = 0;

  const titleLower = item.title?.toLowerCase() || '';
  const summaryLower = item.summary?.toLowerCase() || '';

  const hotKeywords = [
    'AI', 'GPT', 'OpenAI', 'Google', 'Apple', 'Meta', 'Microsoft',
    'iPhone', 'Samsung', 'Tesla', 'Trump', 'Putin', 'Biden',
    'Nvidia', 'chip', 'Semicon', 'tariffs', 'trade war',
    'Bitcoin', 'Crypto', 'USD', 'Fed', 'interest rate'
  ];

  for (const kw of hotKeywords) {
    if (titleLower.includes(kw.toLowerCase())) score += 10;
  }

  if (item.summary?.length > 100) score += 5;
  if (/\d+/.test(titleLower)) score += 5;
  if (item.source === 'BBC' || item.source === 'Reuters') score += 10;

  return score;
}

module.exports = { rankNews, getHotNews, DEFAULT_TOP, MIN_SCORE };