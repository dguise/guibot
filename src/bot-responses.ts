// You need to create this manually, just export a string with your token in it.
// You'll find the token in https://api.slack.com/apps/<your_id>/oauth
import botToken from "./token";
import * as Slack from "slack-node";
import { ReactionAdded, Member, DirectMessage } from "./event-reactions/types";

export class BotResponse {
  slack: Slack;
  userList: Member[];

  constructor() {
    this.slack = new Slack(botToken);

    // Cache all users
    this.slack.api('users.list', (err, res) => {
      this.userList = res.members;
    });
  }
  
  handleCallMeHandReaction(payload: ReactionAdded) {
    if (payload.reaction === "call_me_hand") {
      const reacter = this.getUser(payload.user);
      const reactee = this.getUser(payload.item_user);
      let reacteeName: string = "Unknown";
      if (reactee !== undefined)
        reacteeName = reacter.name;

      this.slack.api('chat.postMessage', {
        text: `${reacter.name} reacted with a :call_me_hand: on one of ${reacteeName}'s post! _Nice!_`,
        channel:'#botty'
      }, (err, response) => { });
    }
  }

  handleDirectMessage(payload: DirectMessage) {
    this.slack.api('chat.postMessage', {
      text: ':middle_finger:',
      channel: payload.channel
    }, (err, response) => { });
  }





  
  private getUser(id: string) {
    return this.userList.filter(mem => mem.id === id)[0];
  }
}