const { SlashCommandBuilder } = require('@discordjs/builders');
const configuration = require('../../../configuration');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('lending-parameters')
  .setDescription('Get current lending parameters'),
  async execute(interaction) {
    let message = `
    Current lending parameters are :
- **upfront cost** : ${configuration.lendParameters.ghstUpfrontCost} ghst
- **borrower** : ${configuration.lendParameters.borrower} %
- **owner** : ${configuration.lendParameters.owner} %
- **other** : ${configuration.lendParameters.other} %
- **lending duration** : ${configuration.lendParameters.time} hour(s)
- **lending activated** : ${configuration.lending}
    `
    return interaction.reply(message);
    },
};
