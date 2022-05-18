const { Client, Intents } = require('discord.js');
const configuration = require('../configuration');
const token = process.env.DISCORD_TOKEN
const idChannelAlerting = process.env.ID_CHANNEL_ALERTING
const idChannelInfo = process.env.ID_CHANNEL_INFO
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const TIME_UNTIL_NEXT_COMMON_COM = 9000000
module.exports = {
  logError(message) {
    console.log(message)
    if(configuration.discordLogLevel.error) {
      client.channels.fetch(idChannelAlerting).then(channel => channel.send(`@everyone ${message.message}`));
    }
  },
  logInfo(message) {
    console.log(message)
    if(configuration.discordLogLevel.info) {
      client.channels.fetch(idChannelInfo).then(channel => channel.send(message));
    }
  },
  logTransaction(message) {
    client.channels.fetch(idChannelInfo).then(channel => channel.send(`@everyone ${message}`));
  },
  async setupDiscordBot() {
    await client.login(token);
    this.notifyCurrentState()
  },
  notifyCurrentState() {
    setTimeout(() => {
      client.channels.fetch(idChannelInfo).then(async channel => {
        let message = ""
        for (const gotchi of configuration.gotchis) {
          if(gotchi.isLent) {
            const timeRemaining = (gotchi.lendingDetails.timeAgreed * 1000 + gotchi.lendingDetails.period * 1000) - new Date().getTime()
            if(timeRemaining < 0) {
              message += `${gotchi.tokenId} should be claimed since ${timeRemaining / 1000 / 60 / 60} hour(s)\n`
            } else {
              message += `${gotchi.tokenId} is lent for ${timeRemaining / 1000 / 60 / 60} hour(s)\n`
            }
          } else if(gotchi.lendingDetails && gotchi.lendingDetails.timeAgreed === "0") {
            message += `${gotchi.tokenId} is listed but not lent\n`
          } else {
            message += `${gotchi.tokenId} is not listed\n`
          }
        }
        const ghstBalance = configuration.web3.utils.fromWei(await configuration.ghstContract.methods.balanceOf(configuration.walletAddress).call())
        message+= `Current GHST balance is : ${ghstBalance}`
        channel.send(`@everyone Here the news:\n${message}`)
        this.notifyCurrentState()
      });
    }, TIME_UNTIL_NEXT_COMMON_COM)
  }
}
