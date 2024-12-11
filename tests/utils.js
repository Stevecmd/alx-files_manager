// tests/utils.js
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';

const testDbName = 'files_manager_test';

class TestUtils {
  static async createTestDb () {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const client = new MongoClient(`mongodb://${host}:${port}/${testDbName}`);
    await client.connect();
    return client.db();
  }

  static async cleanTestDb (db) {
    await db.collection('users').deleteMany({});
    await db.collection('files').deleteMany({});
  }

  static async createTestUser (db) {
    const email = `test-${uuidv4()}@test.com`;
    const password = 'test123!';
    const hashedPassword = sha1(password);
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword
    });
    return {
      id: result.insertedId,
      email,
      password,
      hashedPassword
    };
  }
}

export default TestUtils;
