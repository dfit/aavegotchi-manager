const configuration = require('../configuration');
const walletUtil = require('./walletUtil');
const discordClient = require('./discord/discordBotManager');

const TWELVE_HOURS_PLUS_10_SEC = 43210;
module.exports = {
  async lendGotchi(gotchi) {
    const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
    if(isGotchiLent) {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} is already listed or borrowed by someone.`)
    } else if(configuration.lending === false){
      discordClient.logInfo(`@everyone Listing gotchis is disabled for now, change parameter to resume gotchi listing.`)
    } else {
      discordClient.logInfo(`@everyone Listing Gotchi ${gotchi.tokenId}.`)
      const transaction = await configuration.aavegotchiContract.methods.addGotchiLending(gotchi.tokenId,
        configuration.web3.utils.toWei(configuration.lendParameters.ghstUpfrontCost), configuration.lendParameters.time * 60 * 60,
        [configuration.lendParameters.owner, configuration.lendParameters.borrower, configuration.lendParameters.other], configuration.walletAddress,
        configuration.lendParameters.thirdPartyAddress, 0,
        ["0x403E967b044d4Be25170310157cB1A4Bf10bdD0f", "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8",
          "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2", "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C"])
      await walletUtil.sendWithPrivateKey(transaction);
      discordClient.logTransaction(`@everyone Gotchi ${gotchi.tokenId} listed.`)
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
    discordClient.logTransaction(`@everyone Gotchi ${gotchi.tokenId} have been petted !`)
  },
  async claimGotchiLending(gotchi) {
    const transaction = await configuration.aavegotchiContract.methods.claimAndEndGotchiLending(gotchi.tokenId)
    await walletUtil.sendWithPrivateKey(transaction, this.lendGotchi, gotchi);
    discordClient.logTransaction(`@everyone Gotchi ${gotchi.tokenId} has been claimed.`)
  },
  async populateGotchisInformations() {
    for (const gotchi of configuration.gotchis) {
      const gotchiInfos = await configuration.aavegotchiContract.methods.getAavegotchi(gotchi.tokenId).call()
      configuration.gotchis.find(gotchiInConfig => gotchiInConfig.tokenId = gotchi.tokenId).infos = gotchiInfos
    }
    discordClient.logInfo(`Gotchis infos refresh.`)
  },
  async unlistGotchi(gotchi) {
    const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
    if(isGotchiLent) {
      discordClient.logInfo(`Can't de-list ${gotchi.tokenId} now because still rented.`)
    } else if(gotchi.lendingDetails  && gotchi.lendingDetails.timeAgreed === "0") {
      const transaction = await configuration.aavegotchiContract.methods.cancelGotchiLending(gotchi.tokenId)
      await walletUtil.sendWithPrivateKey(transaction);
      discordClient.logTransaction(`@everyone Gotchi ${gotchi.tokenId} de-listed.`)
    }
  },
  async isChannelable(gotchi) {
    const lastChanneling = await configuration.realmContract.methods.getLastChanneled(gotchi.tokenId).call()
    return new Date(lastChanneling * 1000).getUTCDate() !== new Date().getUTCDate()
  }
  // async getGotchiList() {
  //   const allAavegotchisOfOwnerRes = await configuration.aavegotchiContract.methods.allAavegotchisOfOwner(configuration.walletAddress).call();
  //   discordClient.logInfo(`Gotchi(s) of wallet ${configuration.walletAddress} found : ${allAavegotchisOfOwnerRes.map(gotchi => gotchi.tokenId).join(",")}`)
  //   configuration.gotchis = allAavegotchisOfOwnerRes.length > 0 ? allAavegotchisOfOwnerRes : configuration.gotchis
  // }
}
