require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');
const subscriber = require("./src/subscriber")
const configuration = require('./configuration');
const diamondcontract = require('./data/diamondcontract');

async function setup() {
  configuration.privateKey = process.env.PRIVATE_KEY
  // configuration.walletAddress = wallet.getWalletAddressByWeb3Connect()
  configuration.aavegotchiContract = new configuration.web3.eth.Contract(diamondcontract.abi, diamondcontract.smartContractAddress);
  configuration.bcSubscription = await subscriber.subscribeSmartContractPastEvent();
}

async function main() {
  await setup();
  while (true) {
    console.log("Waiting...")
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}
main()
