import * as fs from "fs";

// It's an interface for client which provides connect of the database to main app.
interface IClient {
  dataSource: string; 
  get data(): any;
}

// This is a simple realization for local json-database client.
export class LocalDBClient implements IClient {
  readonly dataSource: string; // Path to database
  
  constructor(source: string) {
    this.dataSource = source;
  }

  // Getting data asynchronously
  get data(): Promise<any> {
    const handler = new Handler(this.dataSource);
    const rawData = handler.readFileAsync();
    return rawData
    // return fs.readFileSync(this.dataSource, {encoding: "utf8"})
  }
}

// This is a class which contains some specific logic for client's work.
class Handler {
  constructor(private arg: any) {}

  readFileAsync = async () => {
    return new Promise((resolve, reject) => {
      fs.readFile(
        this.arg,
        {encoding: "utf8"},
        (err, data) => {
          if (err) { 
            console.log(err);
            reject();
          }
          resolve(data);
        }
      );
    });
  };

  // This is a realization of function which generate random value for amount-field in mock db.
  floating(min: number, max: number, fixed: number) {
    return (Math.random() * (max - min) + min).toFixed(2);
  }
}