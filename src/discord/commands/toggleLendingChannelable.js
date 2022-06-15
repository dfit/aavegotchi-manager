const { SlashCommandBuilder } = require('@discordjs/builders');
const configurationManager = require('../../../configurationManager');
const configuration = require('../../../configuration');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('toggle-lending-channelable')
  .setDescription('Stop or resume all lending for gotchi that have channel available'),
  async execute(interaction) {
    configurationManager.togglePauseIfChannelingReady(!configuration.pauseIfChannelingReady)
    return interaction.reply(configuration.pauseIfChannelingReady ? 'Lending stopped for channelable gotchi!' : 'Lending resumed for channelable gotchi!' );
  },
};
