const configuration = require('../configuration');
const gotchiManager = require('./gotchiManager');
const walletUtil = require('./walletUtil');
const discordClient = require('./discordLogClient');

module.exports = {
  async routineCheck() {
    await gotchiManager.populateGotchisInformations()
    if(configuration.lendParameters.thirdPartyAddress !== "0x0000000000000000000000000000000000000000") await this.initiateGhstThirdPartySending()
    for (const gotchi of configuration.gotchis) {
      await this.initiateGotchiCaringProcess(gotchi)
      const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
      gotchi.isLent = isGotchiLent
      let lendingDetails = null
      try {
        lendingDetails = await configuration.aavegotchiContract.methods.getGotchiLendingFromToken(
          gotchi.tokenId).call()
        gotchi.lendingDetails = lendingDetails
      } catch (error) {
        gotchi.lendingDetails = null
        discordClient.logInfo(`No listing found for Gotchi ${gotchi.tokenId}.`)
      }
      if(isGotchiLent) {
        await this.initiateLendingCheckProcess(gotchi, lendingDetails)
      } else if(lendingDetails && lendingDetails.timeAgreed === "0") {
        discordClient.logInfo(`Gotchi ${gotchi.tokenId} listed but not rented yet.`)
      } else {
        await this.initiateLendingStartProcess(gotchi)
      }
    }
  },
  async initiateLendingCheckProcess(gotchi, lendingDetails) {
    discordClient.logInfo(`Gotchi ${gotchi.tokenId} is already listed or borrowed by ${lendingDetails.borrower}.`)
    if(new Date().getTime() > (lendingDetails.timeAgreed * 1000 + lendingDetails.period * 1000)) {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} is going to be claimed.`)
      await gotchiManager.claimGotchiLending(gotchi)
    } else {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} can't be claimed yet.`)
    }
  },
  async initiateLendingStartProcess(gotchi) {
    await gotchiManager.lendGotchi(gotchi)
  },
  async initiateGotchiCaringProcess(gotchi) {
    const nextInteractionDate = new Date(gotchi.infos.lastInteracted * 1000).setHours(
      new Date(gotchi.infos.lastInteracted * 1000).getHours() + 12)
    const secondUntilNextPettingSession = (nextInteractionDate - new Date().getTime()) / 1000
    if(secondUntilNextPettingSession < 0) {
      await gotchiManager.petGotchiV2(gotchi, secondUntilNextPettingSession)
    } else {
      discordClient.logInfo(`Gotchi ${gotchi.tokenId} will be petted in ${secondUntilNextPettingSession} seconds.`)
    }
  },
  async initiateGhstThirdPartySending() {
    const ghstBalance = await configuration.ghstContract.methods.balanceOf(configuration.walletAddress).call()
    discordClient.logInfo(`Balance of ${configuration.walletAddress} : ${configuration.web3.utils.fromWei(ghstBalance)} GHST`)
    if (configuration.web3.utils.fromWei(ghstBalance) > 1) {
      const transaction = await configuration.ghstContract.methods.transfer(
        configuration.lendParameters.thirdPartyAddress, ghstBalance)
      await walletUtil.sendWithPrivateKey(transaction);
      discordClient.logTransaction(`${configuration.web3.utils.fromWei(
        ghstBalance)} GHST transferred to ${configuration.lendParameters.thirdPartyAddress} !`)
    }
  }
}
