const { SlashCommandBuilder } = require('@discordjs/builders');
const configurationManager = require('../../../configurationManager');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop-lending')
  .setDescription('Stop all lending and cancel current listing !'),
  async execute(interaction) {
    configurationManager.toggleLendingListing(false)
    return interaction.reply('Lending stopped and listing canceled for next routine iteration!');
  },
};
