const fs = require('fs');
const path = require('path');

const POSTED_FILE = 'posted-links.json';
const RETENTION_HOURS = 24;

/**
 * Load posted links from file with cleanup of expired entries
 */
function loadPostedLinks() {
  try {
    if (fs.existsSync(POSTED_FILE)) {
      const data = JSON.parse(fs.readFileSync(POSTED_FILE, 'utf8'));
      cleanup(data);
      return data;
    }
  } catch (e) {
    console.log('⚠️ No posted-links.json, creating new');
  }
  return { links: [], lastCleanup: new Date().toISOString() };
}

/**
 * Save posted links to file
 */
function savePostedLinks(data) {
  fs.writeFileSync(POSTED_FILE, JSON.stringify(data, null, 2));
}

/**
 * Remove links older than RETENTION_HOURS
 */
function cleanup(data) {
  const cutoff = Date.now() - (RETENTION_HOURS * 60 * 60 * 1000);
  const validLinks = data.links.filter(entry => entry.postedAt > cutoff);
  data.links = validLinks;
  data.lastCleanup = new Date().toISOString();
}

/**
 * Check if a link has been posted within the retention period
 * @param {string} link - URL to check
 * @returns {boolean} - true if duplicate
 */
function checkDuplicate(link) {
  const data = loadPostedLinks();
  const normalizedLink = normalizeUrl(link);
  return data.links.some(entry => normalizeUrl(entry.link) === normalizedLink);
}

/**
 * Mark a link as posted
 * @param {string} link - URL that was posted
 * @param {string} title - Title of the post
 */
function markPosted(link, title) {
  const data = loadPostedLinks();
  data.links.push({
    link: normalizeUrl(link),
    title: title,
    postedAt: Date.now(),
    postedAtISO: new Date().toISOString()
  });
  savePostedLinks(data);
  console.log(`📝 Marked as posted: ${title.substring(0, 50)}...`);
}

/**
 * Normalize URL for comparison (remove trailing slash, lowercase)
 */
function normalizeUrl(url) {
  return url.replace(/\/$/, '').toLowerCase();
}

module.exports = { checkDuplicate, markPosted, loadPostedLinks };