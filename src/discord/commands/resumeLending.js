const { SlashCommandBuilder } = require('@discordjs/builders');
const configurationManager = require('../../../configurationManager');
const configuration = require('../../../configuration');
const gotchiManager = require('../../gotchiManager');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('resume-lending')
  .setDescription('Start or restart lending for all gotchis managed'),
  async execute(interaction) {
    configurationManager.toggleLendingListing(true)
    for (const gotchi of configuration.gotchis) {
      gotchiManager.lendGotchi(gotchi)
    }
    return interaction.reply('Lending resumed and listing restarted for next routine iteration!');
    },
};
