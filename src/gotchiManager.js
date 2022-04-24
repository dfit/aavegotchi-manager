const configuration = require('../configuration');
const walletUtil = require('./walletUtil');
const discordClient = require('./discordLogClient');

const TWELVE_HOURS_PLUS_10_SEC = 43210;
module.exports = {
  async lendGotchi(gotchi) {
    const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
    if(isGotchiLent) {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} is already listed or borrowed by someone.`)
    } else {
      discordClient.logInfo(`Listing Gotchi ${gotchi.tokenId}.`)
      const transaction = await configuration.aavegotchiContract.methods.addGotchiLending(gotchi.tokenId,
        configuration.web3.utils.toWei(configuration.lendParameters.ghstUpfrontCost), configuration.lendParameters.time * 60 * 60,
        [configuration.lendParameters.owner, configuration.lendParameters.borrower, configuration.lendParameters.other], configuration.walletAddress,
        configuration.lendParameters.thirdPartyAddress, 0,
        ["0x403E967b044d4Be25170310157cB1A4Bf10bdD0f", "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8",
          "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2", "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C"])
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
        discordClient.logInfo(`Gotchi ${gotchi.tokenId} have been petted !`)
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
      configuration.gotchis.find(gotchiInConfig => gotchiInConfig.tokenId = gotchi.tokenId).infos = gotchiInfos
    }
    discordClient.logInfo(`Gotchis infos refresh.`)
  },
  // async getGotchiList() {
  //   const allAavegotchisOfOwnerRes = await configuration.aavegotchiContract.methods.allAavegotchisOfOwner(configuration.walletAddress).call();
  //   discordClient.logInfo(`Gotchi(s) of wallet ${configuration.walletAddress} found : ${allAavegotchisOfOwnerRes.map(gotchi => gotchi.tokenId).join(",")}`)
  //   configuration.gotchis = allAavegotchisOfOwnerRes.length > 0 ? allAavegotchisOfOwnerRes : configuration.gotchis
  // }
}
