## Aavegotchi automatizer

It is for me a good exercise to get more familiar with web3 dev environment and mechanics.

Any comment, remark or suggestions would be highly appreciated.

## Main actions

The purpose of the bot is to perform some tasks such as managing the lending, petting without having to manually doing them.

The manager will for each gotchis given :
* check if a petting actions can be bone
* check if a lending is available
* check if a claim is available

A discord bot is connected to give some feedback :
* report all error to a dedicated channel if setup.
* send all interesting transaction (eg: lend, pet, claimed) to an info channel.
* A time based report send the current lending state of the gotchi, if it has channel available or when it will be.

You can also interact with the discord bot with somes commands : 
* /lending-parameters : Get current lending parameters 
* /news : Get news about current managed gotchis 
* /update-lending-options : Change all gotchis lending parameters 
* /stop-lending : Stop all lending and cancel current listing 
* /resume-lending : Start or restart lending for all gotchis managed

In test : dynamic setting of options when channel is/will be available during the timeframe of the lending duration setted.


## How it works ##

A configuration file take all the informations needed and use them across all routines to perform all actions listed.
Actions are runs based on a 5 minutes period.

An update will use only events to perform actions and will be more efficient.

## Prerequisites

* node
* [Alchemy](https://dashboard.alchemyapi.io/) account (free for this usage)
* [Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) set
* (pm2 if wanted)


## IMPORTANT ##
Please don't hesitate to ask if you're not sure about a specific part of the code before starting it.

## Steps to install

### 1. Clone the repo

```bash 
https://github.com/dfit/aavegotchi-manager.git
```

### 2. Install npm package

```bash 
npm install
```

### 3. Env vars

Every needed information (token/id/...) and the way to obtain them is describe in the [discordjs](https://discordjs.guide/#before-you-begin) guide.
```bash 
export PRIVATE_KEY=<enter-your-private-key> 
//private key (until I find something better ...)
export DISCORD_TOKEN=<enter-your-discord-token>
export ID_CHANNEL_ALERTING=<enter-your-alert-channel-id>
export ID_CHANNEL_INFO=<enter-your-info-channel-id>
export ID_COMMANDS=<enter-your-command-channel-id>
export ID_CLIENT=<enter-your-application-id> //go to https://discord.com/developers/applications/me and find "application id" and copy it
export ID_GUILD=<enter-your-discord-server-id> //right click on channel and select "copy id"
```

### 4. How to run the bot
```bash
node main https://polygon-mainnet.g.alchemy.com/v2/<replace-with-your-cred> wss://polygon-mainnet.g.alchemy.com/v2/<replace-with-your-cred>
```

### 5. How to run the bot (alternative)

Alternatively you can use the [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/) command to run your bot on background and managing it a little bit better.

You can add the `--no-autorestart` to `pm2` command in order to only execute the bot once.

```bash
pm2 start main.js --no-autorestart -- https://polygon-mainnet.g.alchemy.com/v2/<replace-with-your-cred> wss://polygon-mainnet.g.alchemy.com/v2/<replace-with-your-cred>
```

### 6. Example

`node main https://polygon-mainnet.g.alchemy.com/v2/<replace-with-your-cred> wss://polygon-mainnet.g.alchemy.com/v2/<replace-with-your-cred>`
```bash
[2022-04-19 19:18:55.394] [LOG]   Public address : 0xa9589438851A7eFBa37bC45ebE2be558c4bA3055
[2022-04-19 19:18:55.415] [LOG]   Initiate naive algo...
[2022-04-19 19:18:56.148] [LOG]   Balance of 0xa9589438851A7eFBa37bC45ebE2be558c4bA3055 : 0 GHST
[2022-04-19 19:18:56.149] [LOG]   Gotchi 99999 will be petted in 29925.851 seconds.
[2022-04-19 19:18:56.495] [LOG]   Gotchi 99999 is already listed or borrowed by 0xA6AeA7b5f826E97c5e54407ba795579CAB0708a8.
[2022-04-19 19:18:56.496] [LOG]   Gotchi 99999 can't be claimed yet.
[2022-04-19 19:23:56.500] [LOG]   Initiate naive algo...
```
