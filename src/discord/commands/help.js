const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('Get all available commands'),
  async execute(interaction) {
    return interaction.reply(`
    Here the list of available commands : 
**/lending-parameters** : Get current lending parameters
**/news : Get news about** current managed gotchis
**/update-lending-options** : Change all gotchis lending parameters
**/stop-lending** : Stop all lending and cancel current listing
**/resume-lending** : Start or restart lending for all gotchis managed
**/toggle-lending-channelable** : Stop or resume all lending for gotchi that have channel available
    `);
  },
};
