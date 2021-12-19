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
    console.log("Processing...");
    return new Handler(this.dataSource).processedData;
  }
}


export class DBGenerator {
  constructor(
    private dataSource: any,
    // public amplitude?: number 
    // public period?: number 
  ) {
    this.generateDB(this.dataSource, this.path);
  }

  get path(): string {
    const parsedPath: any = path.parse(this.dataSource);
    return path.join(parsedPath.dir, 'genDB.json');
  }

  // This function checks genDB.json existence
  private checkFile: (path: string) => Promise<boolean> = async (path) => {
    return new Promise((resolve) => fs.readFile(path, "utf8", (isNoFile) => {
      if (isNoFile) {
        let interval = setTimeout(() => resolve(false), 1000);
        clearInterval(interval);
      };
      resolve(true);
    }));
  }

  // This function generates new database
  generateDB: (dataSource: string, path: string) => void = async (dataSource, path) => {
    const processedData = new Handler(dataSource).processedData;
    this.checkFile(path).then(check => {
      if(!check) {
        processedData.then(data => {
          console.log("Processing data");
          fs.writeFile(path, JSON.stringify(data), (err) => {
            if (err) console.error(err.message);
          });
        });
      }
    });
  }
}

// This is a class which provides some specific logic for client's work.
class Handler {
  constructor(
    private dataSource: any,
    public amplitude?: number 
    ) {}

  get processedData(): Promise<any> {
    return this.processData(this.dataSource);
  }

  // This function takes JSON file and processes it using the floating function.
  private processData: (dataSource: string) => Promise<any> = async (dataSource) => {
    return new Promise((resolve, reject) => {
      fs.readFile(
        dataSource,
        "utf8",
        (err, file) => {
          if (err) { 
            console.log(err);
            reject();
          }
          const parsedJSON = this.processJSON(file, this.amplitude);
          resolve(parsedJSON);
        }
      );
    });
  }
  // START 
  // I want to put this processing to DBGenerator but do it later
  private processJSON(file: any, amplitude: number = 200): any {
    const parsedJSON = JSON.parse(file);
    const parsedData: Array<any> = parsedJSON.data;
    parsedData.forEach(transaction => {
      if(typeof transaction.amount === "string") {
        // console.log("first generation");
        // Evaluate amount field with "this.floating(min: number, max: number, fixed: number)"
        transaction.amount = eval(`this.${transaction.amount}`);
      } else {
        // console.log("second generation");
        // Evaluate amount field if there is a number"
        amplitude /= 2;
        let add: number = this.floating(-amplitude, amplitude, 2);
        let buffer: number = transaction.amount;
        buffer >= amplitude ? buffer += add : buffer += Math.abs(add) ;
        transaction.amount = parseFloat(buffer.toFixed(2));
      }
    });
    return parsedJSON;
  }

  // This is a realization of function which generate random value for amount-field in mock db.
  floating(min: number, max: number, fixed: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(fixed));
  }
  //END
}