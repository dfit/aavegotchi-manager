const configuration = require('../configuration');
const gotchiManager = require('./gotchiManager');
const diamondcontract = require('../data/diamondcontract');
const discordClient = require('./discordLogClient');
module.exports = {
  async subscribeSmartContractEvent() {
    return new configuration.web3Wss.eth.Contract(diamondcontract.abi, diamondcontract.smartContractAddress).events.Transfer(
      {
        filter: {to: configuration.walletAddress, _tokenId: configuration.gotchis.map(gotchi => gotchi.tokenId)},
      },
      async (error, result) => {
        if (!error) {
          const gotchi = await configuration.aavegotchiContract.methods.getAavegotchi(result.returnValues._tokenId).call();
          discordClient.logInfo(`Gotchi ${result.returnValues._tokenId} received ! Gotchi caring initiated.`)
          discordClient.logInfo(`Lending of ${result.returnValues._tokenId} starting.`)
          await gotchiManager.lendGotchi(gotchi);
        }
        if (error) {
          discordClient.logError(error)
          await this.retrySubscribe();
        }
      })
  },
  async subscribeSmartContractPastEvent() {
    await configuration.aavegotchiContract.getPastEvents('Transfer',
      {
        filter: {to: configuration.walletAddress, _tokenId: configuration.gotchis.map(gotchi => gotchi.tokenId)},
        fromBlock: 27246117,
        toBlock: 27246120
      },
      async (error, result) => {
        if (!error) {
          const gotchi = await configuration.aavegotchiContract.methods.getAavegotchi(result[0].returnValues._tokenId).call();
          discordClient.logInfo(`Gotchi ${result[0].returnValues._tokenId} received ! Gotchi caring initiated.`)
          discordClient.logInfo(`Lending of ${result[0].returnValues._tokenId} starting.`)
          await gotchiManager.lendGotchi(gotchi);
        }
        if (error) {
          discordClient.logError(error)
          await this.retrySubscribe();
        }
      })
  },
  async subscribeGotchisCaring() {
    for (const gotchi of configuration.gotchis) {
      const nextInteractionDate = new Date(gotchi.lastInteracted * 1000).setHours(
        new Date(gotchi.lastInteracted * 1000).getHours() + 12)
      const secondUntilNextPettingSession = (nextInteractionDate - new Date().getTime()) / 1000
      gotchiManager.petGotchi(gotchi, secondUntilNextPettingSession)
    }
  },
  async subscribeClaimGotchiLending() {
    //claimAndEndGotchiLending
    for (const gotchi of configuration.gotchis) {
      const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
      if(isGotchiLent) {
        discordClient.logInfo(`Gotchi ${gotchi.tokenId} is already listed or borrowed by someone.`)
        const lendingDetails = await configuration.aavegotchiContract.methods.getGotchiLendingFromToken(gotchi.tokenId).call()
        gotchiManager.claimGotchiLending(gotchi)
        discordClient.logInfo(lendingDetails)
      }
    }
  },
  subscribeGotchiToLendingService() {
    configuration.gotchis.forEach(gotchi => {
      discordClient.logInfo(`Check lend status of gotchi : ${gotchi.tokenId}.`)
      gotchiManager.lendGotchi(gotchi).then(r => discordClient.logInfo(`Lend actions done for ${gotchi.tokenId}`))
    })
  },
  async retrySubscribe () {
    if (configuration.bcSubscription != null) {
      await configuration.bcSubscription.unsubscribe(async function (error, success) {
        if (success) {
          discordClient.logInfo('Re-subscribing!');
          configuration.bcSubscription.resubscribe()
        }
        if (error) {
          discordClient.logInfo('Fail to unsubscribe!');
          discordClient.logError(error);
          process.exit();
        }
      });
    }
  }
}
