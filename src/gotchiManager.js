const configuration = require('../configuration');
const walletUtil = require('./walletUtil');
const discordClient = require('./discord/discordBotManager');

const TWELVE_HOURS_PLUS_10_SEC = 43210;

function prepareLendingTransaction(gotchi) {
  let lendingOptions = [configuration.lendParameters.owner, configuration.lendParameters.borrower, configuration.lendParameters.other]
  let ghstUpfrontCost = configuration.lendParameters.ghstUpfrontCost
  let lendingTime = configuration.lendParameters.time
  if(gotchi.channel.isChannelable || gotchi.channel.hourUntilNextChannel < configuration.lendParameters.time) {
    lendingTime = Math.ceil(gotchi.channel.hourUntilNextChannel) <= 4 ? 4 : Math.ceil(gotchi.channel.hourUntilNextChannel)
    ghstUpfrontCost = "0.5"
    lendingOptions = [0, 100, 0]
  }
  return configuration.aavegotchiContract.methods.addGotchiLending(gotchi.tokenId,
    configuration.web3.utils.toWei(ghstUpfrontCost),
    lendingTime * 60 * 60,
    lendingOptions,
    configuration.walletAddress,
    configuration.lendParameters.thirdPartyAddress, 0,
    ["0x403E967b044d4Be25170310157cB1A4Bf10bdD0f", "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8",
      "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2", "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C"]);
}

module.exports = {
  async lendGotchi(gotchi) {
    const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
    if(isGotchiLent) {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} is already listed or borrowed by someone.`)
    } else if(configuration.lending === false){
      discordClient.logInfo(`@everyone Listing gotchis is disabled for now, change parameter to resume gotchi listing.`)
    } else {
      discordClient.logInfo(`@everyone Listing Gotchi ${gotchi.tokenId}.`)
      const transaction = await prepareLendingTransaction(gotchi)
      await walletUtil.sendWithPrivateKey(transaction);
      discordClient.logTransaction(`Gotchi ${gotchi.tokenId} listed.`)
    }
  },
  petGotchi(gotchi, nextInteractionInSec) {
    new Promise(() => {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} will be petted in ${nextInteractionInSec} second(s).`)
      nextInteractionInSec *= 1000
      setTimeout(async () => {
        const transaction = configuration.aavegotchiContract.methods.interact([gotchi.tokenId]);
        await walletUtil.sendWithPrivateKey(transaction);
        discordClient.logInfo(`@everyone Gotchi ${gotchi.tokenId} have been petted !`)
        this.petGotchi(gotchi, TWELVE_HOURS_PLUS_10_SEC)
      }, nextInteractionInSec)
    });
  },
  async petGotchiV2(gotchi) {
    const transaction = configuration.aavegotchiContract.methods.interact([gotchi.tokenId]);
    await walletUtil.sendWithPrivateKey(transaction);
    discordClient.logTransaction(`Gotchi ${gotchi.tokenId} have been petted !`)
  },
  async claimGotchiLending(gotchi) {
    const transaction = await configuration.aavegotchiContract.methods.claimAndEndGotchiLending(gotchi.tokenId)
    await walletUtil.sendWithPrivateKey(transaction, this.lendGotchi, gotchi);
    discordClient.logTransaction(`Gotchi ${gotchi.tokenId} has been claimed.`)
  },
  async populateGotchisInformations() {
    for (const gotchi of configuration.gotchis) {
      const gotchiInfos = await configuration.aavegotchiContract.methods.getAavegotchi(gotchi.tokenId).call()
      const channelInformations = await this.getChannelInformations(gotchi)
      if (channelInformations.isChannelable && !gotchi.channel.isChannelable) discordClient.logTransaction(`Gotchi ${gotchi.tokenId} is ready for channel!`)
      gotchi.infos = gotchiInfos
      gotchi.channel = channelInformations
    }
    discordClient.logInfo(`Gotchis infos refresh.`)
  },
  async unlistGotchi(gotchi) {
    const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
    if(isGotchiLent) {
      discordClient.logInfo(`Can't de-list ${gotchi.tokenId} now because still rented.`)
    } else if(gotchi.lendingDetails  && gotchi.lendingDetails.timeAgreed === "0") {
      const transaction = await configuration.aavegotchiContract.methods.cancelGotchiLendingByToken(gotchi.tokenId)
      await walletUtil.sendWithPrivateKey(transaction);
      discordClient.logTransaction(`Gotchi ${gotchi.tokenId} de-listed.`)
    }
  },
  async getChannelInformations(gotchi) {
    const lastChannelingDate = new Date(await configuration.realmContract.methods.getLastChanneled(gotchi.tokenId).call() * 1000)
    let nextChannelingDate = new Date(lastChannelingDate.getTime())
    nextChannelingDate.setDate(nextChannelingDate.getDate() + 1)
    nextChannelingDate.setUTCHours(0)
    nextChannelingDate.setUTCMinutes(0)
    nextChannelingDate.setUTCSeconds(0)
    const timeUntillNextChannel = (nextChannelingDate - new Date().getTime()) / 36e5;
    return {isChannelable: timeUntillNextChannel < 0, hourUntilNextChannel: timeUntillNextChannel}
  }
  // async getGotchiList() {
  //   const allAavegotchisOfOwnerRes = await configuration.aavegotchiContract.methods.allAavegotchisOfOwner(configuration.walletAddress).call();
  //   discordClient.logInfo(`Gotchi(s) of wallet ${configuration.walletAddress} found : ${allAavegotchisOfOwnerRes.map(gotchi => gotchi.tokenId).join(",")}`)
  //   configuration.gotchis = allAavegotchisOfOwnerRes.length > 0 ? allAavegotchisOfOwnerRes : configuration.gotchis
  // }
}
