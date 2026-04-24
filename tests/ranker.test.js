const { rankNews, getHotNews, DEFAULT_TOP, MIN_SCORE } = require('../src/feeds/ranker');

describe('ranker.js', () => {
  describe('rankNews', () => {
    test('should return top items sorted by hotScore descending', () => {
      const scoredItems = [
        { title: 'Item 1', hotScore: 30 },
        { title: 'Item 2', hotScore: 50 },
        { title: 'Item 3', hotScore: 20 },
        { title: 'Item 4', hotScore: 40 }
      ];
      const ranked = rankNews(scoredItems, { top: 3 });
      expect(ranked).toHaveLength(3);
      expect(ranked[0].hotScore).toBe(50);
      expect(ranked[1].hotScore).toBe(40);
      expect(ranked[2].hotScore).toBe(30);
    });

    test('should filter items below MIN_SCORE', () => {
      const scoredItems = [
        { title: 'Hot', hotScore: 50 },
        { title: 'Cold', hotScore: 10 },
        { title: 'Warm', hotScore: 25 }
      ];
      const ranked = rankNews(scoredItems, { top: 5, minScore: 20 });
      expect(ranked).toHaveLength(2);
      expect(ranked.find(i => i.title === 'Hot')).toBeDefined();
      expect(ranked.find(i => i.title === 'Warm')).toBeDefined();
      expect(ranked.find(i => i.title === 'Cold')).toBeUndefined();
    });

    test('should use default top value of 5', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        title: `Item ${i}`,
        hotScore: 100 - i
      }));
      const ranked = rankNews(items);
      expect(ranked).toHaveLength(5);
    });

    test('should return empty array when all items below threshold', () => {
      const items = [
        { title: 'Item 1', hotScore: 5 },
        { title: 'Item 2', hotScore: 10 }
      ];
      const ranked = rankNews(items, { minScore: 20 });
      expect(ranked).toHaveLength(0);
    });
  });

  describe('getHotNews', () => {
    test('should score and rank items in one call', () => {
      const items = [
        { title: 'OpenAI announces AI model', summary: 'OpenAI announces something' },
        { title: 'Weather report for tomorrow', summary: 'It will be sunny tomorrow' }
      ];
      const hotNews = getHotNews(items, { top: 2 });
      expect(hotNews.length).toBeGreaterThan(0);
      expect(hotNews[0]).toHaveProperty('hotScore');
      if (hotNews.length > 1) {
        expect(hotNews[0].hotScore).toBeGreaterThanOrEqual(hotNews[1].hotScore);
      }
    });
  });

  describe('constants', () => {
    test('DEFAULT_TOP should be 5', () => {
      expect(DEFAULT_TOP).toBe(5);
    });

    test('MIN_SCORE should be 20', () => {
      expect(MIN_SCORE).toBe(20);
    });
  });
});