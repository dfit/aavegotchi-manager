const { SlashCommandBuilder } = require('@discordjs/builders');
const discordUtil = require('../util/discordUtil');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('news')
  .setDescription('Get news about current managed gotchis'),
  async execute(interaction) {
    return interaction.reply(discordUtil.getGotchisNews());
    },
};
