import dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import { LocalDBClient, DBGenerator } from './controller';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

const templateDBPath: string = path.join(__dirname, '../src/db/db.json');

const database = new DBGenerator(templateDBPath);
const controller = new LocalDBClient(database.path);
// const controller = new LocalDBClient(rawDBPath);

app.get("/", (req: any, res: any) => {
  controller.data.then(data => {
    res.status(200);
    res.json(data);
  }).catch(err => console.error(err));
});

app.listen(PORT);