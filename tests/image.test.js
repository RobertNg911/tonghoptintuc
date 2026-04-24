const axios = require('axios');
jest.mock('axios');

const { generateImage } = require('../src/services/image');

describe('image.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImage', () => {
    test('should construct correct Pollinations URL with encoded prompt', async () => {
      axios.get.mockResolvedValueOnce({ data: Buffer.from('fake-image-data') });

      const prompt = 'A beautiful sunset';
      await generateImage(prompt);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('image.pollinations.ai'),
        expect.objectContaining({
          responseType: 'arraybuffer',
          timeout: 90000,
          maxRedirects: 5
        })
      );
    });

    test('should encode special characters in prompt', async () => {
      axios.get.mockResolvedValueOnce({ data: Buffer.from('fake-image-data') });

      const prompt = 'A dog & cat playing';
      await generateImage(prompt);

      const callUrl = axios.get.mock.calls[0][0];
      expect(callUrl).toContain(encodeURIComponent(prompt));
    });

    test('should return buffer data on success', async () => {
      const fakeBuffer = Buffer.from('fake-image-data');
      axios.get.mockResolvedValueOnce({ data: fakeBuffer });

      const result = await generateImage('Test prompt');
      expect(result).toBe(fakeBuffer);
    });

    test('should try fallback URL on primary failure', async () => {
      axios.get
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({ data: Buffer.from('fallback-data') });

      const result = await generateImage('Test prompt');

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('fallback-data');
    });

    test('should throw error when both primary and fallback fail', async () => {
      axios.get.mockRejectedValueOnce(new Error('Primary error')).mockRejectedValueOnce(new Error('Fallback error'));

      await expect(generateImage('Test prompt')).rejects.toThrow('Image gen failed');
    });

    test('should include width and height in URL parameters', async () => {
      axios.get.mockResolvedValueOnce({ data: Buffer.from('fake-image-data') });

      await generateImage('Test prompt');

      const callUrl = axios.get.mock.calls[0][0];
      expect(callUrl).toContain('width=1024');
      expect(callUrl).toContain('height=1024');
    });

    test('should include nologo parameter', async () => {
      axios.get.mockResolvedValueOnce({ data: Buffer.from('fake-image-data') });

      await generateImage('Test prompt');

      const callUrl = axios.get.mock.calls[0][0];
      expect(callUrl).toContain('nologo=true');
    });
  });
});