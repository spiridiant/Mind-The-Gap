import { remultExpress } from 'remult/remult-express';
import { Record } from '../shared/record';
import { MongoClient } from "mongodb"
import { MongoDataProvider } from "remult/remult-mongo"

require('dotenv').config();
console.log(process.env['MONGODB_URL']);
export const api = remultExpress({
    entities: [Record],
    dataProvider: async () => {
        const client = new MongoClient(process.env.MONGODB_URL || " mongodb://localhost:3002/records");
        await client.connect();
        return new MongoDataProvider(client.db("records"), client);
    }
})