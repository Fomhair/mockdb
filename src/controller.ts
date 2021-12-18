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
    const data = handler.processData();
    return data;
  }
}

// This is a class which contains some specific logic for client's work.
class Handler {
  constructor(private arg: any) {}

  // This function takes JSON file and processes it using the floating function.
  processData = async () => {
    return new Promise((resolve, reject) => {
      fs.readFile(
        this.arg,
        "utf8",
        (err, file) => {
          if (err) { 
            console.error(err);
            reject();
          }
          const parsedJSON = JSON.parse(file);
          const parsedData: Array<any> = parsedJSON.data;
          parsedData.forEach(transaction => {
            transaction.amount = eval(`this.${transaction.amount}`) // Evaluate amount field with "this.floating(min: number, max: number, fixed: number)"
          });
          resolve(parsedData);
        }
      );
    });
  };

  // This is a realization of function which generate random value for amount-field in mock db.
  floating(min: number, max: number, fixed: number) {
    return (Math.random() * (max - min) + min).toFixed(fixed);
  }
}