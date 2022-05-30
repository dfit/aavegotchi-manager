const { SlashCommandBuilder } = require('@discordjs/builders');
const configurationManager = require('../../../configurationManager');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('resume-lending')
  .setDescription('Start or restart lending for all gotchis managed !'),
  async execute(interaction) {
    configurationManager.toggleLendingListing(true)
    return interaction.reply('Lending resumed and listing restarted for next routine iteration!');
    },
};
