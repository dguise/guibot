// You need to create this manually, just export a string with your token in it.
// You'll find the token in https://api.slack.com/apps/<your_id>/oauth
import botToken from "./token";
import * as Slack from "slack-node";
import * as Events from "./event-reactions/types";

import * as shell from "shelljs";
import { text } from "body-parser";
import { handlePointsForReaction, getFunniest, getAllFunny, getAllAgreeable, getMostAgreeable } from "./features/funny-points";
import { word } from "./util";
import { runMigrations } from "./features/migrations";

type BotState = {
  ShouldReactRoger: boolean,
  ShouldEnhanceEmojis: boolean,
  ShouldIdentifyLitComments: boolean,
}

export class BotResponse {
  slack: Slack;
  userList: Events.Member[];
  state: BotState;
  version: string;

  // stuff printed by "list"
  private functionality: string[] = 
    ["roger reactions", 
    "emoji enhancing",
    "fire identification"];

  constructor() {
    this.slack = new Slack(botToken);
    this.state = { 
      ShouldEnhanceEmojis: false,
      ShouldReactRoger: false,
      ShouldIdentifyLitComments: false,
    };
    // Cache all users
    this.slack.api('users.list', (err, res) => {
      this.userList = res.members;
    });
    const version = shell.exec("git describe --tags").stdout;
    this.version = version.match(/v(\d+\.?){2}\d+/g)[0];
    
    runMigrations(this.version);

    this.slack.api('chat.postMessage', {
      text: `I was just restarted with version ${this.version}! :tada: You can find the changelog at https://github.com/dguise/guibot`,
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
    handlePointsForReaction(payload);
  }
  handleEmojiReactionRemoved(payload: Events.ReactionAdded) {
    handlePointsForReaction(payload, true);
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

    if (payload.text.toLowerCase().match(word("lit"))) {
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

    if (payload.text.toLowerCase().match(word("kom"))) {
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
        const all = getAllFunny();
        let print = "";
        for (const rankedUser of all) {
          const username = this.getUsername(rankedUser.user);
          print += username + ": " + rankedUser.points + " \r\n";
        }
        this.slack.api('chat.postMessage', {
          text: print,
          channel: payload.channel
        }, (err, response) => { });
      }
      else if (text.includes("agreeable")) {
        const all = getAllAgreeable();
        let print = "";
        for (const rankedUser of all) {
          const username = this.getUsername(rankedUser.user);
          print += username + ": " + rankedUser.points + " \r\n";
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
      else if (text.includes("most agreeable")) {
        this.slack.api('chat.postMessage', {
          text: this.getUsername(getMostAgreeable().user) + ' is the most agreeable! :impressed:',
          channel: payload.channel
        }, (err, response) => { });
      }
      else if (text.includes("best")) {
        this.slack.api('chat.postMessage', {
          text: this.getRandomUsername() + ' is the best! :sunglasses:',
          channel: payload.channel
        }, (err, response) => { });
      }
    }
    else if (text.includes("what")) {
      if (text.includes("version")) {
        this.slack.api('chat.postMessage', {
          text: 'I\'m version ' + this.version + '! :tada:',
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
    if (text.includes("fire identification"))
      this.state.ShouldIdentifyLitComments = enable;

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

  private getUsername(id: string): string {
    const user = this.getUser(id);
    let username = id;

    if (user)
      username = user.name; 

    return username;
  }

  private getRandomUsername(): string {
    var user = this.userList[Math.floor(Math.random() * (this.userList.length + 5))];
    var name = 'mrKjell';
    
    if (user)
      name = user.name;
      
    return name
  }
}
