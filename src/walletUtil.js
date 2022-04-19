const configuration = require('../configuration');
module.exports = {
  getWalletAddress() {
    let account = configuration.web3.eth.accounts.privateKeyToAccount(configuration.privateKey);
    console.log(`Public address : ${account.address}`)
    return account.address;
  },
  async sendWithPrivateKey(transaction, callback, parameter) {
  const account = configuration.web3.eth.accounts.privateKeyToAccount(configuration.privateKey).address;
  const estimateGas = await configuration.web3.eth.getGasPrice();
  const options = {
    to: transaction._parent._address,
    data: transaction.encodeABI(),
    gas: await transaction.estimateGas({from: account}),
    maxFeePerGas: estimateGas < configuration.web3.utils.toWei("40", "Gwei") ? estimateGas : configuration.web3.utils.toWei("40", "Gwei"),
    maxPriorityFeePerGas: estimateGas < configuration.web3.utils.toWei("40", "Gwei") ? estimateGas : configuration.web3.utils.toWei("40", "Gwei"),
    type: 0x2
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
