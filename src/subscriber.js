const configuration = require('../configuration');
const vaultManager = require('./gotchiManager');
module.exports = {
  async subscribeSmartContractEvent() {
    return configuration.aavegotchiContract.events.Transfer(
      {
        filter: {to: configuration.walletAddress, _tokenId: configuration.gotchiId},
      },
      async (error, result) => {
        if (!error) {
          const gotchi = await configuration.aavegotchiContract.methods.getAavegotchi(result.returnValues._tokenId).call();
          console.log(`Gotchi  deposit ${result.returnValues._tokenId} received ! Auto - Lending process initiated.`)
          console.log(`Checking if ${result.returnValues._tokenId} need petting ...`)
          await vaultManager.petGotchi(gotchi);

          await vaultManager.lendGotchi(gotchi);
        }
        if (error) {
          console.log(error)
          await this.retrySubscribe();
        }
      })
  },
  async subscribeSmartContractPastEvent() {
    await configuration.aavegotchiContract.getPastEvents('Transfer',
      {
        filter: {to: configuration.walletAddress, _tokenId: configuration.gotchiId},
        fromBlock: 27246117,
        toBlock: 27246120
      },
      async (error, result) => {
        if (!error) {
          const gotchi = await configuration.aavegotchiContract.methods.getAavegotchi(result[0].returnValues._tokenId).call();
          console.log(`Gotchi  deposit ${result[0].returnValues._tokenId} received ! Gotchi caring initiated.`)
          console.log(`Checking if ${result[0].returnValues._tokenId} need petting ...`)
          await vaultManager.petGotchi(gotchi);
          console.log(`Lending of ${result[0].returnValues._tokenId} starting.`)
          await vaultManager.lendGotchi(gotchi);
        }
        if (error) {
          console.log(error)
          await this.retrySubscribe();
        }
      })
  },
  async retrySubscribe () {
    if (configuration.bcSubscription != null) {
      await configuration.bcSubscription.unsubscribe(async function (error, success) {
        if (success) {
          console.log('Re-subscribing!');
          configuration.bcSubscription.resubscribe()
        }
        if (error) {
          console.log('Fail to unsubscribe!');
          console.log(error);
          process.exit();
        }
      });
    }
  }
}
