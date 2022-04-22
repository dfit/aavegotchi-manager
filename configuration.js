const Web3 = require('web3');
const providerHttp = process.argv[2]
const providerWSS = process.argv[3]
let web3Wss = new Web3(providerWSS);
let web3 = new Web3(providerHttp);

module.exports = {
  discordLogLevel: {
    info: false,
    error: true
  },
  web3Wss: web3Wss,
  web3: web3,
  walletAddress: null,
  privateKey: "",
  bcSubscription: null,
  ghstContract: null,
  aavegotchiContract: null,
  lendParameters : {
    thirdPartyAddress: "0x0000000000000000000000000000000000000000",
    time: 2, //hours
    ghstUpfrontCost: "0.1",
    borrower: 70,
    owner: 30,
    other: 0
  },
  gotchis: [{tokenId: 20322}] // override with gotchis in case gotchi already lend I cannot get the original owner of the gotchi easily todo
}
