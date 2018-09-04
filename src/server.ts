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

      // Each event has to be registered in 
      // https://api.slack.com/apps/<your_id>/event-subscriptions
      const body = req.body.event;
      console.log("body.event:");
      console.log(body);
      switch (body.type) {
        case "reaction_added":
          this.responses.handleCallMeHandReaction(body);
          break;
        case "message":
          // this doesn't work. The direct messages doesn't broadcast any event
          this.responses.handleDirectMessage(body);
          this.responses.handleRogerMessage(body);
          break;
        case "app_mention":
          this.responses.handleMention(body);
          break;
        case "emoji_changed":
          this.responses.handleEmojiAdd(body);
          break;
      }

      // If we don't respond to this request, the App will eventually be disabled
      // because it assumes our App isn't working.
      res.sendStatus(200);
    });
  }
}


