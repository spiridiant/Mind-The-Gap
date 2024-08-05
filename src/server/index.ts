import express from 'express'

const app = express();
app.get("/api/hi", (req, res) => res.send('hello world'))
app.listen(3002, () => console.log("Started..."))