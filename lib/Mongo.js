import { MongoClient } from 'mongodb';


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'autocarro';

export async function getDB() {
  if (!client.topology?.isConnected()) {
    await client.connect();
  }
  return client.db(dbName);
}
