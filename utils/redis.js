import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * Construct a new Redis client.
   *
   * It creates a new connection to Redis server and sets up event listeners for connection
   * and error events. It also creates promisified versions of get, set, and del methods.
   */
  constructor () {
    this.client = createClient();
    this.connected = false;

    this.client.on('error', (err) => {
      console.error('Redis client not connected to the server:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
      this.connected = true;
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Wait for the Redis client to connect before proceeding
    this.waitForConnection().then(() => {
      console.log(this.isAlive());
    });
  }

  /**
   * Wait for the Redis client to connect.
   */
  async waitForConnection () {
    if (!this.connected) {
      await new Promise((resolve) => {
        this.client.on('connect', () => {
          this.connected = true;
          resolve();
        });
      });
    }
  }

  /**
   * Returns a boolean indicating whether the client is connected to the Redis server.
   *
   * @return {boolean} true if the client is connected, false otherwise
   */
  async isAlive () {
    await this.waitForConnection();
    return this.client.connected;
  }

  /**
   * Retrieve a value from Redis by key.
   *
   * @param {string} key
   * @return {Promise<string|null>} The value associated with the key, or null if no value is associated.
   */
  async get (key) {
    await this.waitForConnection();
    return this.getAsync(key);
  }

  /**
   * Sets a value in Redis, with an optional TTL.
   *
   * @param {string} key
   * @param {string} value
   * @param {number} [duration] The TTL in seconds. If not provided, the value will persist
   *   indefinitely.
   */
  async set (key, value, duration) {
    await this.waitForConnection();
    await this.setAsync(key, value);
    this.client.expire(key, duration);
  }

  /**
   * Deletes a value from Redis by key.
   *
   * @param {string} key - The key of the value to delete.
   * @return {Promise<number>} A promise that resolves to the number of keys that were removed.
   */
  async del (key) {
    await this.waitForConnection();
    return this.delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
