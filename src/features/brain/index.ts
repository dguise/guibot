import * as brain from "brain.js";
import Db from "object-to-file";
import { networkInterfaces } from "os";

type Msg = {
  message: string;
  username: string;
};

export class Intellecticus {
  net: brain.NeuralNetwork;
  db: Db;
  jsonData: brain.INeuralNetworkJSON;

  messageBuffer: Msg[] = [];

  constructor() {
    this.net = new brain.NeuralNetwork({ hiddenLayers: [3] });
    this.db = new Db("brain-data");
    const data = this.db.read("data");
    if (data)
      this.net.fromJSON(data);
  }

  addMessage(message: string, username: string) {
    this.messageBuffer.push({ message, username });
  }

  reTrain(): number {
    this.net = new brain.NeuralNetwork({ hiddenLayers: [3] });
    this.net.fromJSON(this.jsonData);

    const trainingData = this.messageBuffer.map(msg => {
      return ({
        input: { [msg.message]: 1 },
        output: { [msg.username]: 1 }
      });
    })

    this.net.train(trainingData);
    this.db.push("data", this.net.toJSON());
    this.messageBuffer = [];
    return trainingData.length;
  }
}