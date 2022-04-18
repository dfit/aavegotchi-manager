const configuration = require('../configuration');
const gotchiManager = require('./gotchiManager');
module.exports = {
  async routineCheck() {
    for (const gotchi of configuration.gotchis) {
      const isGotchiLent = await configuration.aavegotchiContract.methods.isAavegotchiLent(gotchi.tokenId).call()
      if(isGotchiLent) {
        await this.initiateLendingCheckProcess(gotchi)
      } else {
        await this.initiateLendingStartProcess(gotchi)
      }
    }
  },
  async initiateLendingCheckProcess(gotchi) {
    const lendingDetails = await configuration.aavegotchiContract.methods.getGotchiLendingFromToken(
      gotchi.tokenId).call()
    console.log(`Gotchi ${gotchi.tokenId} is already listed or borrowed by ${lendingDetails.borrower}.`)
    if(lendingDetails.completed) {
      await gotchiManager.claimGotchiLending(gotchi)
      await this.initiateLendingStartProcess(gotchi)
    }
  },
  async initiateLendingStartProcess(gotchi) {
    await gotchiManager.lendGotchi(gotchi)
  }
}
