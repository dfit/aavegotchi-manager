const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const configuration = require('../../configuration');
const configurationManager = require('../../configurationManager');
const discordUtil = require('./util/discordUtil');
const token = process.env.DISCORD_TOKEN
const guildId = process.env.ID_GUILD
const clientId = process.env.ID_CLIENT
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const TIME_UNTIL_NEXT_COMMON_COM = 9000000
const idChannelAlerting = process.env.ID_CHANNEL_ALERTING
const idChannelInfo = process.env.ID_CHANNEL_INFO

module.exports = {
  registerBotCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
  },
  registerBotCommandsHandler() {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      client.commands.set(command.data.name, command);
    }

    client.once('ready', () => {
      console.log('Ready!');
    });

    client.on('interactionCreate', async interaction => {
      if (interaction.isModalSubmit()) {
        this.handleModals(interaction)
      }
      if (!interaction.isCommand()) return;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
      }
    });
  },
  logError(message) {
    console.log(message)
    if(configuration.discordLogLevel.error) {
      client.channels.fetch(idChannelAlerting).then(channel => channel.send(`${message.message}`));
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
    this.registerBotCommands();
    this.registerBotCommandsHandler();
    await client.login(token);
    this.notifyCurrentState();
  },
  notifyCurrentState() {
    setTimeout(() => {
      client.channels.fetch(idChannelInfo).then(async channel => {
        let message = discordUtil.getNews();
        channel.send(`@everyone Here the news:\n${message}`)
        this.notifyCurrentState()
      });
    }, TIME_UNTIL_NEXT_COMMON_COM)
  },
  handleModals(interaction) {
    if(interaction.customId === "update-lending-options") {
      const ghstUpfrontCost = interaction.fields.getTextInputValue('ghstUpfrontCost');
      const borrowerShare = interaction.fields.getTextInputValue('borrowerShare');
      const ownerShare = interaction.fields.getTextInputValue('ownerShare');
      const otherShare = interaction.fields.getTextInputValue('otherShare');
      const lendingDuration = interaction.fields.getTextInputValue('lendingDuration');
      console.log({ ghstUpfrontCost, borrowerShare, ownerShare,otherShare, lendingDuration });
      configurationManager.updateLendingParameters(ghstUpfrontCost, borrowerShare, ownerShare, otherShare, lendingDuration)
      return interaction.reply(`Gotchi lending parameters updated with :\n- ghstUpfrontCost: ${ghstUpfrontCost} GHST\n- borrowerShare: ${borrowerShare}%\n- ownerShare: ${ownerShare}%\n- otherShare: ${otherShare}%\n- lendingDuration: ${lendingDuration} hour(s)`);
    }
  }
}
