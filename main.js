require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');
const configuration = require('./configuration');
const diamondcontract = require('./data/diamondcontract');
const realmContract = require('./data/realmcontract');
const walletUtil = require('./src/walletUtil');
const naiveAlgo = require('./src/naiveAlgo');
const ghstContract = require('./data/ghstcontract');
const discordClient = require('./src/discord/discordBotManager');

const TIME_BETWEEN_ITERATION = 400000;

async function setup() {
  await discordClient.setupDiscordBot()
  configuration.privateKey = process.env.PRIVATE_KEY
  configuration.walletAddress = walletUtil.getWalletAddress()
  configuration.aavegotchiContract = new configuration.web3.eth.Contract(diamondcontract.abi, diamondcontract.smartContractAddress);
  configuration.ghstContract = new configuration.web3.eth.Contract(ghstContract.abi, ghstContract.smartContractAddress);
  configuration.realmContract = new configuration.web3.eth.Contract(realmContract.abi, realmContract.smartContractAddress);

  // ---- VERSION WITH OPTIMAL JOB (to rework) ----
  // subscriber.subscribeClaimGotchiLending()
  // subscriber.subscribeGotchisCaring()
  // subscriber.subscribeGotchiToLendingService()
  // configuration.bcSubscription = await subscriber.subscribeSmartContractEvent();
}

async function main() {
  try {
    discordClient.logInfo("Initiate naive algo...")
    await naiveAlgo.routineCheck()
  } catch (e) {
    console.log(e)
    discordClient.logError(e)
  }
  setTimeout(() => {
    main()
  }, TIME_BETWEEN_ITERATION)
}
setup().then(() => main());

