# Guise Bot
### Guibot

# Development
## Prerequisites

- Install [Node.js](https://nodejs.org/en/)
- All commands assumes your command prompt's working directory is in the root of the project.

## Setting up

> npm install

## Building 

> npm run build

## Starting the server

> npm start

... Then browse to localhost:3000


# Slack administrative setup

#### Create app & bot user
- https://api.slack.com/apps
- https://api.slack.com/apps/your_id/bots?

#### Complete Slack Event Challenge
https://api.slack.com/apps/your_id/event-subscriptions?

... And add the events you want to listen to

#### Add permissions / scope 
https://api.slack.com/apps/your_id/oauth

Make sure it has the Scopes your events require.

#### Install App in workspace
https://api.slack.com/apps/your_id/oauth

... You should now get requests when your event is triggered