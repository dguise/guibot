// You need to create this manually, just export a string with your token in it.
// You'll find the token in https://api.slack.com/apps/<your_id>/oauth
import botToken from "./token";
import * as Slack from "slack-node";
import * as Events from "./event-reactions/types";

import * as shell from "shelljs";
import { text } from "body-parser";

type BotState = {
  ShouldReactRoger: boolean,
  ShouldEnhanceEmojis: boolean,
}

export class BotResponse {
  slack: Slack;
  userList: Events.Member[];
  state: BotState;


  constructor() {
    this.slack = new Slack(botToken);
    this.state = { 
                  ShouldEnhanceEmojis: true
                , ShouldReactRoger: true
              };
    // Cache all users
    this.slack.api('users.list', (err, res) => {
      this.userList = res.members;
    });
    const version = shell.exec("git describe --tags").stdout;
    const versionRegex = /(\d+\.){3}/g;

    this.slack.api('chat.postMessage', {
      text: `I was just restarted to version ${version.match(versionRegex)}! :tada: You can find the changelog at https://github.com/dguise/guibot`,
      channel: "#botty"
    }, (err, response) => { });
  }
  
  handleEmojiReaction(payload: Events.ReactionAdded) {
    if (!this.state.ShouldEnhanceEmojis) return;

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

  handleChannelMessage(payload: Events.Message) {
    this.handleRogerMessage(payload);
    this.handleLitMessage(payload);
  }

  handleLitMessage(payload: Events.Message) {
    if ((payload as any).subtype === 'message_deleted') return;

    if (payload.text.toLowerCase().includes("lit")) {
      this.slack.api('reactions.add', {
        name: 'fire',
        channel: payload.channel,
        timestamp: payload.ts,
      }, (err, res) => console.log(res));
    }
  }

  handleRogerMessage(payload: Events.Message) {
    if ((payload as any).subtype === 'message_deleted') return;
    if (!this.state.ShouldReactRoger) return;

    if (payload.text.includes("kom")) {
      this.slack.api('reactions.add', {
        name: 'roger',
        channel: payload.channel,
        timestamp: payload.ts
      }, (err, res) => { console.log(res); });
    }
  }

  handleMention(payload: Events.Message) {
    const text = payload.text;
    text.includes
    if (text.includes("enable")) {
      this.changeState(true, payload);
    }
    else if (text.includes("disable")) {
      this.changeState(false, payload);
    }
    else if (text.includes("list")) {
      this.slack.api('chat.postMessage', {
        text: 'You can configure ' + this.functionality.join(', '),
        channel: payload.channel
      }, (err, response) => { });
    }
    else {
      this.slack.api('chat.postMessage', {
        text: 'Sorry, I simply could _not_ understand that. :shrug:',
        channel: payload.channel
      }, (err, response) => { });
    }
  }

  private functionality: string[] = 
    ["roger reactions", 
    "emoji enhancing",];
  private changeState(enable: boolean, payload: Events.Message) {
    const text = payload.text;
    if (text.includes("roger reactions"))
      this.state.ShouldReactRoger = enable;
    if (text.includes("emoji enhancing"))
      this.state.ShouldEnhanceEmojis = enable;

    this.slack.api('reactions.add', {
      name: 'heavy_check_mark',
      channel: payload.channel,
      timestamp: payload.ts
    }, (err, res) => { console.log(res); });
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