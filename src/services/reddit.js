const axios = require('axios');

// Reddit rate limit: 60 requests/minute (1 req/sec)
const RATE_LIMIT_DELAY_MS = 1000; // 1 second between requests
const DEFAULT_USER_AGENT = 'nodejs:tonghoptintuc:v1.1 (by /u/automated)';

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch hot posts from a subreddit
 * @param {string} subreddit - Subreddit name (without r/)
 * @param {object} options - { limit, userAgent, category }
 * @returns {Promise<Array>} - Normalized post objects
 */
async function fetchSubredditPosts(subreddit, options = {}) {
  const limit = options.limit || 10;
  const userAgent = process.env.REDDIT_USER_AGENT || options.userAgent || DEFAULT_USER_AGENT;
  const category = options.category || 'hot';

  const url = `https://www.reddit.com/r/${subreddit}/${category}.json`;
  const params = { limit };

  try {
    console.log(`Fetching r/${subreddit} (${category})...`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent
      },
      params
    });

    // Check for rate limit headers (Reddit returns these)
    const remaining = response.headers['x-ratelimit-remaining'];
    const resetTime = response.headers['x-ratelimit-reset'];

    if (remaining !== undefined && parseInt(remaining) < 5) {
      console.warn(`⚠️ Rate limit low: ${remaining} requests remaining`);
    }

    const posts = response.data?.data?.children || [];

    // Normalize to match RSS feed format
    const normalized = posts.map(post => {
      const p = post.data;
      return {
        title: p.title || '',
        link: p.url || `https://www.reddit.com${p.permalink}`,
        pubDate: new Date(p.created_utc * 1000).toISOString(),
        source: `Reddit r/${subreddit}`,
        subreddit: subreddit,
        score: p.score || 0,
        numComments: p.num_comments || 0,
        permalink: p.permalink || '',
        author: p.author || '',
        category: 'reddit'
      };
    });

    console.log(`✅ r/${subreddit}: ${normalized.length} posts`);

    // Rate limiting: delay before next request
    await sleep(RATE_LIMIT_DELAY_MS);

    return normalized;

  } catch (error) {
    if (error.response?.status === 429) {
      console.error(`❌ Rate limited on r/${subreddit}. Retry after: ${error.response.headers['retry-after'] || 'unknown'}`);
      throw new Error(`Reddit rate limit exceeded for r/${subreddit}`);
    }
    console.error(`❌ Failed to fetch r/${subreddit}: ${error.message}`);
    throw error;
  }
}

/**
 * Fetch posts from multiple subreddits
 * @param {Array} subreddits - List of subreddit names
 * @param {object} options - { limit, userAgent }
 * @returns {Promise<Array>} - Combined and normalized posts
 */
async function fetchRedditPosts(subreddits, options = {}) {
  const allPosts = [];

  for (const subreddit of subreddits) {
    try {
      const posts = await fetchSubredditPosts(subreddit, options);
      allPosts.push(...posts);
    } catch (error) {
      console.error(`❌ Skipping r/${subreddit} due to error: ${error.message}`);
      // Continue with other subreddits
    }
  }

  return allPosts;
}

module.exports = { fetchRedditPosts, fetchSubredditPosts };
