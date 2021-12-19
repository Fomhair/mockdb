import * as fs from "fs";
import path from "path/posix";

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
    const database = new Handler(this.dataSource);
    const data = database.processedData;
    console.log("Processing...");
    return data;
  }
}


export class DBGenerator {
  constructor(
    private dataSource: any,
    public amplitude?: number,
    public period?: number
  ) {
    this.generateDB(this.dataSource, this.path);
  }

  get path(): string {
    const parsedPath: any = path.parse(this.dataSource);
    return path.join(parsedPath.dir, 'genDB.json');
  }

  // This function checks genDB.json existence
  checkFile: (path: string) => Promise<boolean> = async (path) => {
    return new Promise((resolve) => fs.readFile(path, "utf8", (isNoFile) => {
      if (isNoFile) {
        let interval = setTimeout(() => resolve(false), 1000);
        clearInterval(interval);
      };
      resolve(true);
    }))
  }

  // This function generates new database
  generateDB: (dataSource: string, path: string) => void = async (dataSource, path) => {
    const handler = new Handler(dataSource);
    const processedData = handler.processedData;
    this.checkFile(path).then(check => {
      if(!check) {
        processedData.then(data => {
          console.log("Processing data");
          fs.writeFile(path, JSON.stringify(data), (err) => {
            if (err) console.error(err.message);
          })
        })
      }
    })
  }
}

// This is a class which contains some specific logic for client's work.
class Handler {
  constructor(private arg: any) {}

  get processedData(): Promise<any> {
    return this.processData(this.arg);
  }

  // This function takes JSON file and processes it using the floating function.
  processData: (arg: string) => Promise<any> = async (arg) => {
    return new Promise((resolve, reject) => {
      fs.readFile(
        arg,
        "utf8",
        (err, file) => {
          if (err) { 
            console.log(err);
            reject();
          }
          const parsedJSON = JSON.parse(file);
          const parsedData: Array<any> = parsedJSON.data;
          parsedData.forEach(transaction => {
            if(typeof transaction.amount === "string") {
              // console.log("first generation");
              // Evaluate amount field with "this.floating(min: number, max: number, fixed: number)"
              transaction.amount = eval(`this.${transaction.amount}`)
            } else {
              // console.log("second generation");
              // Evaluate amount field if there is a number"
              let add: number = this.floating(-100,100,2);
              let buffer: number = transaction.amount;
              buffer >= 100 ? buffer += add : buffer += Math.abs(add) 
              transaction.amount = parseFloat(buffer.toFixed(2));
            }
          });
          resolve(parsedJSON);
        }
      );
    });
  };

  // This is a realization of function which generate random value for amount-field in mock db.
  floating(min: number, max: number, fixed: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(fixed));
  }
}