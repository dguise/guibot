// You need to create this manually, just export a string with your token in it.
// You'll find the token in https://api.slack.com/apps/<your_id>/oauth
import botToken from "./token";
import * as Slack from "slack-node";
import * as Events from "./event-reactions/types";

import * as shell from "shelljs";
import { text } from "body-parser";
import { handleFunnyReaction, getFunniest, getAllFunny } from "./features/funny-points";

type BotState = {
  ShouldReactRoger: boolean,
  ShouldEnhanceEmojis: boolean,
}

export class BotResponse {
  slack: Slack;
  userList: Events.Member[];
  state: BotState;

  // stuff printed by "list"
  private functionality: string[] = 
    ["roger reactions", 
    "emoji enhancing",];

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
    const versionRegex = /(\d+\.?)+/g;

    this.slack.api('chat.postMessage', {
      text: `I was just restarted with version v${version.match(versionRegex)[0]}! :tada: You can find the changelog at https://github.com/dguise/guibot`,
      channel: "#botty"
    }, (err, response) => { });
  }
  
  enhanceEmojis(payload: Events.ReactionAdded) {
    if (!this.state.ShouldEnhanceEmojis) return;

    this.slack.api('reactions.add', {
      name: payload.reaction,
      channel: payload.item.channel,
      timestamp: payload.item.ts
    }, (err, res) => { console.log(res); });
  }

  handleEmojiReaction(payload: Events.ReactionAdded) {
    this.enhanceEmojis(payload);
    handleFunnyReaction(payload);
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
    if (!payload.text) return;

    const text = payload.text.toLowerCase();
    
    if (text.includes("enable")) {
      this.changeState(true, payload);
    }
    else if (text.includes("disable")) {
      this.changeState(false, payload);
    }
    else if (text.includes("list")) {
      if (text.includes("functionality")) {
        this.slack.api('chat.postMessage', {
          text: 'You can configure ' + this.functionality.join(', '),
          channel: payload.channel
        }, (err, response) => { });
      }
      else if (text.includes("funny")) {
        const funnyList = getAllFunny();
        let print = "";
        for (const funny of funnyList) {
          const username = this.getUsername(funny.user);
          print += username + ": " + funny.points + " \r\n";
        }
        this.slack.api('chat.postMessage', {
          text: print,
          channel: payload.channel
        }, (err, response) => { });
      }
    }
    else if (text.includes("who")) {
      if (text.includes("funniest")) {
        this.slack.api('chat.postMessage', {
          text: this.getUsername(getFunniest().user) + ' is the funniest! :gladsanders:',
          channel: payload.channel
        }, (err, response) => { });
      }
    }
    else {
      this.slack.api('chat.postMessage', {
        text: 'Sorry, I simply could _not_ understand that. :shrug:',
        channel: payload.channel
      }, (err, response) => { });
    }
  }

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
  
  private getUser(id: string): Events.Member {
    const user = this.userList.filter(mem => mem.id === id)[0];
    return user;
  }

  private getUsername(id: string): String {
    const user = this.getUser(id);
    let username = id;

    if (user)
      username = user.name; 

    return username;
  }
}