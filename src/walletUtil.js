const configuration = require('../configuration');
const discordClient = require('./discord/discordBotManager');
const MAX_GWEI = "80";
module.exports = {
  getWalletAddress() {
    let account = configuration.web3.eth.accounts.privateKeyToAccount(configuration.privateKey);
    discordClient.logInfo(`Public address : ${account.address}`)
    return account.address;
  },
  async sendWithPrivateKey(transaction, callback, parameter) {
  const account = configuration.web3.eth.accounts.privateKeyToAccount(configuration.privateKey).address;
  const estimateGas = await configuration.web3.eth.getGasPrice();
  const options = {
    to: transaction._parent._address,
    data: transaction.encodeABI(),
    gas: await transaction.estimateGas({from: account}),
    maxFeePerGas: estimateGas < configuration.web3.utils.toWei(MAX_GWEI, "Gwei") ? estimateGas : configuration.web3.utils.toWei(MAX_GWEI, "Gwei"),
    maxPriorityFeePerGas: estimateGas < configuration.web3.utils.toWei(MAX_GWEI, "Gwei") ? estimateGas : configuration.web3.utils.toWei(MAX_GWEI, "Gwei"),
    type: 0x2
  };
  const signed  = await configuration.web3.eth.accounts.signTransaction(options, configuration.privateKey);
  configuration.web3.eth.sendSignedTransaction(signed.rawTransaction)
  .on('transactionHash',(hash) => {
    discordClient.logInfo(`txHash: ${JSON.stringify(hash)}`)
  })
  .on('receipt',async (receipt) => {
    discordClient.logInfo(`receipt: ${JSON.stringify(receipt)}`)
    if (callback != null && parameter != null) {
      await callback(parameter);
    }
  })
  .on('error', (error => {
    discordClient.logError(`error: ${JSON.stringify(error)}`)
  }));
}
}
