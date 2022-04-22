const { Client, Intents } = require('discord.js');
const configuration = require('../configuration');
const token = process.env.DISCORD_TOKEN
const idChannelAlerting = process.env.ID_CHANNEL_ALERTING
const idChannelInfo = process.env.ID_CHANNEL_INFO
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
module.exports = {
  async logError(error) {
    console.log(error)
    if(configuration.discordLogLevel.error) {
      const channel = await client.channels.fetch(idChannelAlerting);
      await channel.send(error)
    }
  },
  async logInfo(message) {
    console.log(message)
    if(configuration.discordLogLevel.info) {
      const channel = await client.channels.fetch(idChannelInfo);
      await channel.send(message)
    }
  },
  async loginBotToDiscord() {
    await client.login(token);
  }
}
