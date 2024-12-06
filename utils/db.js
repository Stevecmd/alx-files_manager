import { MongoClient } from 'mongodb';

class DBClient {
  /**
   * Construct a new DB client.
   *
   * Creates a new connection to MongoDB server and sets up event listeners for connection
   * and error events.
   */
  constructor () {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.connected = false;

    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB client not connected to the server:', err);
      } else {
        console.log('MongoDB client connected to the server');
        this.connected = true;
        this.db = this.client.db(database);
      }
    });
  }

  /**
   * Returns a boolean indicating whether the client is connected to the MongoDB server.
   *
   * @return {boolean} true if the client is connected, false otherwise
   */
  isAlive () {
    return this.connected;
  }

  /**
   * Returns the number of documents in the collection users.
   *
   * @return {Promise<number>} The number of documents in the collection users.
   */
  async nbUsers () {
    if (!this.connected) {
      return 0;
    }
    return this.db.collection('users').countDocuments();
  }

  /**
   * Returns the number of documents in the collection files.
   *
   * @return {Promise<number>} The number of documents in the collection files.
   */
  async nbFiles () {
    if (!this.connected) {
      return 0;
    }
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
