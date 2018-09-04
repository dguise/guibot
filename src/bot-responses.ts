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
    console.log(payload.user);
    this.slack.api('reactions.add', {
      name: payload.reaction,
      channel: payload.item.channel,
      timestamp: payload.item.ts
    }, (err, res) => { console.log(res); });
  }

  handleDirectMessage(payload: Events.DirectMessage) {
    console.log(payload.channel_type);
    if (payload.channel_type === "app_home") {
      this.slack.api('chat.postMessage', {
        text: ':middle_finger:',
        channel: payload.channel
      }, (err, response) => { });
    }
  }

  handleRogerMessage(payload: Events.Message | any) {
    if (payload.subtype === 'message_deleted') return;

    if (payload.text.indexOf("kom") !== -1) {
      this.slack.api('reactions.add', {
        name: 'roger',
        channel: payload.channel,
        timestamp: payload.ts
      }, (err, res) => { console.log(res); });
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