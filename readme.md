# Guibot
Slack bot.
# Development
## Prerequisites

- Install [Node.js](https://nodejs.org/en/)
- All commands assumes your command prompt's working directory is in the root of the project.

- For testing; port forward a path to your computer (requires a change in Slack Administrative UI as well, so that Slack posts requests to your IP instead of production server)

## Setting up

> npm install

## Building 

> npm run build

## Starting the server

> npm run server

## Building and starting server

> npm start


# Releasing
See [Tentacl](https://github.com/maakep/tentacl) - tldr: push a tag with a semantic versioning version tag: v1.0.2 triggers a build of selected magnitude (in this project we need major releases every release)

# Slack administrative setup
This is only done once, to set up the bot in the Slack UI.
#### Create app & bot user
- https://api.slack.com/apps
- https://api.slack.com/apps/your_id/bots?

#### Complete Slack Event Challenge
https://api.slack.com/apps/your_id/event-subscriptions?

... And add the events you want to listen to (this has to be done for every new event you'd like to listen to)

#### Add permissions / scope 
https://api.slack.com/apps/your_id/oauth

Make sure it has the Scopes your events require.

#### Install App in workspace
https://api.slack.com/apps/your_id/oauth

... You should now get requests when your event is triggered