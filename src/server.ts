import * as http from "http";
import app from "./express-app";
import { BotResponse } from "./bot-responses";

export class Server {
  server: http.Server;
  responses: BotResponse;

  constructor(port: string) {
    this.responses = new BotResponse();
    this.configureRouting();

    this.server = http.createServer(app);
    this.server.listen(port, () => {
      console.log("listening on *:" + port);
    });
  }

  configureRouting() {
    app.post('/', (req, res) => {
      if (req.body["challenge"] !== undefined) {
        res.send(req.body["challenge"]);
        return;
      }
        const body = req.body.event;

      // Each event has to be registered in 
      // https://api.slack.com/apps/<your_id>/event-subscriptions
      switch (body.type) {
        case "reaction_added":
          this.responses.handleCallMeHandReaction(body);
          break;

      }

      // If we don't respond to this request, the App will eventually be disabled
      res.sendStatus(200);
    });
  }
}


