const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // Use environment variable for MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function generateKey() {
  const key = generateRandomKey();
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 1); // Set expiration time to 1 hour

  try {
    await client.connect();
    const database = client.db('keygen_db'); // Use your database name
    const collection = database.collection('keys'); // Use your collection name

    // Insert the key into the collection
    const result = await collection.insertOne({
      key: key,
      status: 'unused',
      creationDate: new Date(),
      expirationDate: expirationDate
    });

    return { key: key, insertedId: result.insertedId };
  } catch (error) {
    console.error('Failed to generate and store key', error);
    throw new Error('Failed to generate key');
  } finally {
    await client.close();
  }
}

function generateRandomKey() {
  return `SA-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
}

module.exports = async (req, res) => {
  try {
    const result = await generateKey();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
