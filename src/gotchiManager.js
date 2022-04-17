const configuration = require('../configuration');


module.exports = {
  async lendGotchi(gotchi) {
    //TODO : need to implement lending
    const transaction = await configuration.aavegotchiContract.methods.addGotchiLending(gotchi.tokenId,
      new configuration.web3.utils.BN(configuration.ghstUpfrontCost), 14400,
      [configuration.owner, configuration.borrower, configuration.other], configuration.walletAddress,
      configuration.thirdPartyAddress, 0,
      ["0x403E967b044d4Be25170310157cB1A4Bf10bdD0f", "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8",
        "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2", "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C"]).call()
    //TODO : call the send tx method
    console.log(transaction)

  },
  async petGotchi(gotchi) {
    const needToBePetted = new Date(gotchi.lastInteracted * 1000).setHours(new Date(gotchi.lastInteracted * 1000).getHours() + 12) < new Date()
    if(!needToBePetted) {
      const transaction = configuration.aavegotchiContract.methods.interact([gotchi.tokenId]);
      await this.sendWithPrivateKey(transaction);
      console.log(`Gotchi ${gotchi.tokenId} have been petted !`)
    } else {
      console.log(`Gotchi ${gotchi.tokenId} doesn't need to be petted !`)
    }
  },
  async sendWithPrivateKey(transaction) {
    const account = configuration.web3.eth.accounts.privateKeyToAccount(configuration.privateKey).address;
    const gasPrice = await configuration.web3.eth.getGasPrice();
    const options = {
      to: transaction._parent._address,
      data: transaction.encodeABI(),
      gas: await transaction.estimateGas({from: account}),
      gasPrice: gasPrice
    };
    const signed  = await configuration.web3.eth.accounts.signTransaction(options, configuration.privateKey);
    configuration.web3.eth.sendSignedTransaction(signed.rawTransaction)
    .on('transactionHash',(hash) => {
      console.log('txHash: ', hash)
    })
    .on('receipt',(receipt) => {
      console.log('receipt: ', receipt)
    })
    .on('error', (error => {
      console.log('error: ', error)
    }));
  },
}
