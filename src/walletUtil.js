const configuration = require('../configuration');
module.exports = {
  getWalletAddress() {
    let account = configuration.web3.eth.accounts.privateKeyToAccount(configuration.privateKey);
    console.log(`Public address : ${account.address}`)
    return account.address;
  },
  async sendWithPrivateKey(transaction, callback, parameter) {
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
  .on('receipt',async (receipt) => {
    console.log('receipt: ', receipt)
    if (callback != null && parameter != null) {
      await callback(parameter);
    }
  })
  .on('error', (error => {
    console.log('error: ', error)
  }));
}
}
