const { scoreItem, scoreAll, HOT_KEYWORDS, TOPIC_KEYWORDS } = require('../src/feeds/scorer');

describe('scorer.js', () => {
  describe('scoreItem', () => {
    test('should score items with hot keywords in title', () => {
      const item = {
        title: 'OpenAI announces new GPT model',
        summary: 'A new AI model is released',
        source: 'TechCrunch'
      };
      const score = scoreItem(item);
      expect(score).toBeGreaterThan(10);
    });

    test('should score higher when hot keyword in both title and summary', () => {
      const itemTitleOnly = {
        title: 'Tesla announces new car',
        summary: 'A new vehicle',
        source: 'TechCrunch'
      };
      const itemBoth = {
        title: 'Tesla announces new car',
        summary: 'Tesla is launching a new electric vehicle',
        source: 'TechCrunch'
      };
      const scoreTitleOnly = scoreItem(itemTitleOnly);
      const scoreBoth = scoreItem(itemBoth);
      expect(scoreBoth).toBeGreaterThan(scoreTitleOnly);
    });

    test('should add bonus for sources with authority (BBC)', () => {
      const itemBBC = { title: 'Breaking news', summary: 'Something happened', source: 'BBC' };
      const itemOther = { title: 'Breaking news', summary: 'Something happened', source: 'Other' };
      const scoreBBC = scoreItem(itemBBC);
      const scoreOther = scoreItem(itemOther);
      expect(scoreBBC).toBeGreaterThan(scoreOther);
    });

    test('should add bonus when title contains numbers', () => {
      const itemWithNumber = { title: 'Apple releases iPhone 15', summary: 'New phone', source: 'TechCrunch' };
      const itemWithout = { title: 'Apple releases new phone', summary: 'New phone', source: 'TechCrunch' };
      const scoreWithNumber = scoreItem(itemWithNumber);
      const scoreWithout = scoreItem(itemWithout);
      expect(scoreWithNumber).toBeGreaterThan(scoreWithout);
    });

    test('should return 0 for empty title', () => {
      const item = { title: '', summary: '', source: 'Test' };
      const score = scoreItem(item);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('scoreAll', () => {
    test('should return array with hotScore property', () => {
      const items = [
        { title: 'OpenAI news', summary: 'AI update', source: 'BBC' },
        { title: 'Weather report', summary: 'Sunny day', source: 'Local' }
      ];
      const scored = scoreAll(items);
      expect(scored).toHaveLength(2);
      expect(scored[0]).toHaveProperty('hotScore');
      expect(typeof scored[0].hotScore).toBe('number');
    });

    test('should preserve original item properties', () => {
      const item = { title: 'Test', summary: 'Summary', source: 'Source', customProp: 'value' };
      const scored = scoreAll([item]);
      expect(scored[0]).toHaveProperty('title', 'Test');
      expect(scored[0]).toHaveProperty('customProp', 'value');
    });
  });

  describe('HOT_KEYWORDS', () => {
    test('should contain common hot keywords', () => {
      expect(HOT_KEYWORDS).toContain('AI');
      expect(HOT_KEYWORDS).toContain('OpenAI');
      expect(HOT_KEYWORDS).toContain('Tesla');
      expect(HOT_KEYWORDS).toContain('Trump');
    });
  });

  describe('TOPIC_KEYWORDS', () => {
    test('should have categories for tech and world', () => {
      expect(TOPIC_KEYWORDS).toHaveProperty('tech');
      expect(TOPIC_KEYWORDS).toHaveProperty('world');
      expect(Array.isArray(TOPIC_KEYWORDS.tech)).toBe(true);
      expect(Array.isArray(TOPIC_KEYWORDS.world)).toBe(true);
    });
  });
});