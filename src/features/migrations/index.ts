import Database from "object-to-file";
import * as Slack from "slack-node";

export function runMigrations(version: string, slack: Slack) {

    this.v24 = () => {
        const funny = new Database("funny-people");
        const agree = new Database("agreeable-people");
    
        funny.truncate();
        agree.truncate();
    }

    this.v25 = () => {
        const funny = new Database("funny-people");
        const agree = new Database("agreeable-people");
    
        funny.delete("rank");
        agree.delete("rank");

        slack.api('chat.postMessage', {
            text: "v25 - Tried to clear ranks",
            channel: "#botty-secret"
        }, (err, response) => { });
    }

    version = version.match(/v\d+/)[0];
    if (version === undefined)
        return;

    const functionToRun = this[version];
    if (typeof functionToRun == "function")
        functionToRun();
}