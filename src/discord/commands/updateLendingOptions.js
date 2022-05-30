const { SlashCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, MessageActionRow } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('update-lending-options')
  .setDescription('Change all gotchis lending parameters'),
  async execute(interaction) {
    const modal = new Modal()
    .setCustomId('update-lending-options')
    .setTitle('Change all gotchis lending parameters');
    const ghstUpfrontCost = new TextInputComponent()
    .setCustomId('ghstUpfrontCost')
    .setLabel("How much GHST upfront cost ?")
    .setStyle('SHORT');
    const borrower = new TextInputComponent()
    .setCustomId('borrowerShare')
    .setLabel("How much % for borrower ?")
    .setStyle('SHORT');
    const owner = new TextInputComponent()
    .setCustomId('ownerShare')
    .setLabel("How much % for owner ?")
    .setStyle('SHORT');
    const lendingDuration = new TextInputComponent()
    .setCustomId('lendingDuration')
    .setLabel("How much hours ?")
    .setStyle('SHORT');

    const firstActionRow = new MessageActionRow().addComponents(ghstUpfrontCost);
    const secondActionRow = new MessageActionRow().addComponents(borrower);
    const thirdActionRow = new MessageActionRow().addComponents(owner);
    const fourthActionRow = new MessageActionRow().addComponents(lendingDuration);
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
    await interaction.showModal(modal);
  },
};
