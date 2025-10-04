import { createMonkkoClient } from '@monkko/orm/connections';

const MONGO_URI = process.env.MONGO_URI;


if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set');
}

export const MongoClient = createMonkkoClient({
    uri: MONGO_URI,
});
