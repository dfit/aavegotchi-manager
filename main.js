require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');
const subscriber = require("./src/subscriber")
const configuration = require('./configuration');
const diamondcontract = require('./data/diamondcontract');
const gotchiManager = require('./src/gotchiManager');
const walletUtil = require('./src/walletUtil');
const naiveAlgo = require('./src/naiveAlgo');
const ghstContract = require('./data/ghstcontract');
const discordClient = require('./src/discordLogClient');

async function setup() {
  await discordClient.loginBotToDiscord()
  configuration.privateKey = process.env.PRIVATE_KEY
  configuration.walletAddress = walletUtil.getWalletAddress()
  configuration.aavegotchiContract = new configuration.web3.eth.Contract(diamondcontract.abi, diamondcontract.smartContractAddress);
  configuration.ghstContract = new configuration.web3.eth.Contract(ghstContract.abi, ghstContract.smartContractAddress);

  // ---- VERSION WITH OPTIMAL JOB (to rework) ----
  // subscriber.subscribeClaimGotchiLending()
  // subscriber.subscribeGotchisCaring()
  // subscriber.subscribeGotchiToLendingService()
  // configuration.bcSubscription = await subscriber.subscribeSmartContractEvent();
}

async function main() {
  await setup();
  while (true) {
    discordClient.sendInfo("Initiate naive algo...")
    await naiveAlgo.routineCheck()
    await new Promise(resolve => setTimeout(resolve, 400000));
  }
}
main()
