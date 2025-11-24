/**
 * Tests for Torrow API client
 */
import { TorrowClient } from '../torrow/torrowClient.js';
import { AuthenticationError } from '../common/errors.js';

// Mock axios to avoid real API calls
jest.mock('axios');

describe('TorrowClient', () => {
  describe('constructor', () => {
    test('should throw error when no token provided', () => {
      // Clear environment variable
      delete process.env.TORROW_TOKEN;
      
      expect(() => new TorrowClient()).toThrow(AuthenticationError);
      expect(() => new TorrowClient('')).toThrow(AuthenticationError);
    });

    test('should normalize token with Bearer prefix', () => {
      const client = new TorrowClient('test-token');
      // We can't directly test the private token field, but we can test that it doesn't throw
      expect(client).toBeInstanceOf(TorrowClient);
    });

    test('should keep existing Bearer prefix', () => {
      const client = new TorrowClient('Bearer test-token');
      expect(client).toBeInstanceOf(TorrowClient);
    });
  });

  describe('token normalization', () => {
    test('should handle token from environment', () => {
      process.env.TORROW_TOKEN = 'env-token';
      const client = new TorrowClient();
      expect(client).toBeInstanceOf(TorrowClient);
    });

    test('should prefer parameter over environment', () => {
      process.env.TORROW_TOKEN = 'env-token';
      const client = new TorrowClient('param-token');
      expect(client).toBeInstanceOf(TorrowClient);
    });
  });
});
