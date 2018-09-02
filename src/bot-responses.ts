// You need to create this manually, just export a string with your token in it.
// You'll find the token in https://api.slack.com/apps/<your_id>/oauth
import botToken from "./token";
import * as Slack from "slack-node";
import * as Events from "./event-reactions/types";

export class BotResponse {
  slack: Slack;
  userList: Events.Member[];

  constructor() {
    this.slack = new Slack(botToken);

    // Cache all users
    this.slack.api('users.list', (err, res) => {
      this.userList = res.members;
    });
  }
  
  handleCallMeHandReaction(payload: Events.ReactionAdded) {
    if (payload.reaction === "call_me_hand") {
      const reacter = this.getUser(payload.user);
      const reactee = this.getUser(payload.item_user);
      let reacteeName: string = "Unknown";
      if (reactee !== undefined)
        reacteeName = reactee.name;

      this.slack.api('chat.postMessage', {
        text: `${reacter.name} reacted with a :call_me_hand: on one of ${reacteeName}'s post! _Nice!_`,
        channel:'#botty'
      }, (err, response) => { });
    }
  }

  handleDirectMessage(payload: Events.DirectMessage) {
    if (payload.channel_type == "app_home") {
      console.log("HandleDirectMessage payload: ");
      console.log(payload);
      this.slack.api('chat.postMessage', {
        text: ':middle_finger:',
        channel: payload.channel
      }, (err, response) => { });
    }
  }

  handleMention(payload: Events.Message) {
    const text = payload.text;
    if (text.indexOf("stardew") !== -1) {
      this.slack.api('chat.postMessage', {
        text: 'valley!',
        channel: payload.channel
      }, (err, response) => { });
    } else {
      this.slack.api('chat.postMessage', {
        text: ':question:',
        channel: payload.channel
      }, (err, response) => { });
    }
  }

  handleEmojiAdd(payload: Events.EmojiAdd) {
    if (payload.subtype === "add") {
      this.slack.api('chat.postMessage', {
        text: `Ny emoji! :pogchamp:`,
        channel: "#emoji-styrelse"
      }, (err, response) => { });

      this.slack.api('chat.postMessage', {
        text: `:${payload.name}: :${payload.name}: :${payload.name}:`,
        channel: "#emoji-styrelse"
      }, (err, response) => { });
    }
  }





  
  private getUser(id: string) {
    return this.userList.filter(mem => mem.id === id)[0];
  }
}