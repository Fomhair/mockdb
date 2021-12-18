import express from 'express';
import * as path from "path";
import { LocalDBClient } from './controller';


// Test server
const app = express();
const PORT = 3030;

const dbpath: string = path.join(__dirname, '../src/db/db.json');
const controller = new LocalDBClient(dbpath);

app.get("/", (req: any, res: any) => {
  res.status(200).send();
});

app.listen(PORT, () => controller.data.then(a => console.log(a)))