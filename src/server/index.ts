import express from 'express'
import { api } from './api'

const app = express();
app.use(api);
app.listen(process.env.PORT || 3002, () => console.log("Started..."));