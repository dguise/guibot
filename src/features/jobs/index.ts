import * as Cron from "cron";
import * as Slack from "slack-node";
import { Intellecticus } from "../brain";


export class JobRunner {
	intellect: Intellecticus;
	slack: Slack;

	constructor(intellect: Intellecticus, slack: Slack) {
		this.intellect = intellect;
		this.slack = slack;

		const job = new Cron.CronJob('00 00 00 * * *', () => {
			const messages = this.intellect.reTrain();
			this.slack.api('chat.postMessage', {
				text: `I just trained with ${messages} messages`,
				channel: "#botty-secret"
			}, (err, response) => { });
		});

		job.start();
	}
}
