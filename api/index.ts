import express from "express";
import { remultExpress } from "remult/remult-express";
import { MongoClient } from "mongodb";
import { MongoDataProvider } from "remult/remult-mongo";
import { Entity, Fields } from 'remult';

@Entity('records', {allowApiCrud : true,})
export class Record {
    @Fields.string({
        dbName: '_id',
        valueConverter: {
          fieldTypeInDb: 'dbid',
        },
      })
    id: string = ''
    @Fields.string()
    username = '';
    @Fields.integer()
    score = 0;
}

const app = express();

const api = remultExpress({
  entities: [Record],
  dataProvider: async () => {
    const client = new MongoClient(process.env["MONGODB_URL"]!);
    await client.connect();
    return new MongoDataProvider(client.db("records"), client);
  },
});

app.use(api);

module.exports = app;
