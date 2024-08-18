const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://new_ok12:s6y459OGYUNkkUJI@cluster0.k8hb7.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function generateKey() {
    const key = generateRandomKey();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Set expiration time to 1 hour

    try {
        await client.connect();
        const database = client.db('keygen_db');
        const collection = database.collection('keys');

        // Insert the key into the collection
        const result = await collection.insertOne({
            key: key,
            status: 'unused',
            creationDate: new Date(),
            expirationDate: expirationDate
        });

        return key;
    } catch (error) {
        console.error('Failed to generate and store key', error);
    } finally {
        await client.close();
    }
}

function generateRandomKey() {
    return `SA-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
}

module.exports = async (req, res) => {
    const key = await generateKey();
    res.status(200).json({ key });
};
