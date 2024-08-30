import express from 'express'
import { remultExpress } from "remult/remult-express"
import { api } from './api'
import { MongoDataProvider } from 'remult/remult-mongo';
import { MongoClient } from 'mongodb';

const app = express();
app.use(api);
app.listen(process.env['PORT'], () => console.log("Started..."));