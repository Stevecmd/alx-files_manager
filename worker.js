import Bull from 'bull';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db.js';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';

const fileQueue = new Bull('fileQueue');

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
