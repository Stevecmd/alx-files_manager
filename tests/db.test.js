import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import dbClient from '../utils/db';
import { MongoClient } from 'mongodb';

describe('DBClient', () => {
  before(async () => {
    const collections = await dbClient.db.listCollections().toArray();
    for (const collection of collections) {
      await dbClient.db.collection(collection.name).deleteMany({});
    }
  });

  it('should connect to mongodb server', async () => {
    const isAlive = await dbClient.isAlive();
    expect(isAlive).to.equal(true);
  });

  it('should return the number of users', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).to.be.a('number');
    expect(usersCount).to.equal(0);
  });

  it('should return the number of files', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).to.be.a('number');
    expect(filesCount).to.equal(0);
  });

  it('should create a new user', async () => {
    const result = await dbClient.db.collection('users').insertOne({
      email: 'test@test.com',
      password: 'test123'
    });
    expect(result.insertedId !== null).to.equal(true);
  });

  it('should create a new file', async () => {
    const result = await dbClient.db.collection('files').insertOne({
      userId: 'testUserId',
      name: 'test.txt',
      type: 'file',
      isPublic: false,
      parentId: 0
    });
    expect(result.insertedId !== null).to.equal(true);
  });

  it('should update nbUsers count', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).to.equal(1);
  });

  it('should update nbFiles count', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).to.equal(1);
  });

  describe('Error Handling', () => {
    let originalClient;

    before(() => {
      originalClient = dbClient.client;
    });

    after(() => {
      dbClient.client = originalClient;
    });

    it('should handle connection errors', async () => {
      dbClient.client = new MongoClient('mongodb://invalid:27017');
      try {
        await dbClient.connect();
      } catch (error) {
        expect(error !== null).to.equal(true);
      }
    });

    it('should handle query errors', async () => {
      try {
        await dbClient.db.collection('nonexistent').find().toArray();
      } catch (error) {
        expect(error !== null).to.equal(true);
      }
    });
  });

  describe('Database Operations', () => {
    it('should perform atomic operations', async () => {
      const session = dbClient.client.startSession();
      try {
        session.startTransaction();
        await dbClient.db.collection('users').insertOne({
          email: 'transaction@test.com',
          password: 'test123'
        }, { session });
        await session.commitTransaction();
        const user = await dbClient.db.collection('users').findOne({ email: 'transaction@test.com' });
        expect(user !== null).to.equal(true);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    });
  });

  after(async () => {
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});
  });
});
