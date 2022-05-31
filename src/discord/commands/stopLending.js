const { SlashCommandBuilder } = require('@discordjs/builders');
const configurationManager = require('../../../configurationManager');
const configuration = require('../../../configuration');
const gotchiManager = require('../../gotchiManager');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop-lending')
  .setDescription('Stop all lending and cancel current listing !'),
  async execute(interaction) {
    configurationManager.toggleLendingListing(false)
    for (const gotchi of configuration.gotchis) {
      gotchiManager.unlistGotchi(gotchi)
    }
    return interaction.reply('Lending stopped and listing canceled for next routine iteration!');
  },
};
