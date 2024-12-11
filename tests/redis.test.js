import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import redisClient from '../utils/redis';

describe('RedisClient', () => {
  before(async () => {
    // Ensure connection is established before tests
    await redisClient.connect();
  });

  after(async () => {
    // Clean up after tests
    await redisClient.client.quit();
  });

  it('should connect to redis server', async () => {
    const alive = await redisClient.isAlive();
    expect(alive).to.equal(true);
  });

  it('should set and get value', async () => {
    await redisClient.set('test_key', 'test_value', 10);
    const value = await redisClient.get('test_key');
    expect(value).to.equal('test_value');
  });

  it('should delete value', async () => {
    await redisClient.set('test_key', 'test_value', 10);
    await redisClient.del('test_key');
    const value = await redisClient.get('test_key');
    expect(value === null).to.equal(true);
  });
});
