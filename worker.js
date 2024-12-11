import Bull from 'bull';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db.js';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';

// Create Bull queues
const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

// Process file queue
fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId)
  });

  if (!file) {
    throw new Error('File not found');
  }

  const filePath = file.localPath;
  const sizes = [500, 250, 100];

  try {
    for (const size of sizes) {
      const thumbnail = await imageThumbnail(filePath, { width: size });
      fs.writeFileSync(`${filePath}_${size}`, thumbnail);
    }
    done();
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw error;
  }
});

// Process user queue
userQueue.process(async (job, done) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.db.collection('users').findOne({
    _id: new ObjectId(userId)
  });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
  done();
});
