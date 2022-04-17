const Web3 = require('web3');
const providerHttp = process.argv[2]
const providerWSS = process.argv[3]
const publicAddress = process.argv[4]
const gotchiId = process.argv[5]
let web3Wss = new Web3(providerWSS);
let web3 = new Web3(providerHttp);

module.exports = {
  web3Wss: web3Wss,
  web3: web3,
  walletAddress: publicAddress,
  thirdPartyAddress: "0x0000000000000000000000000000000000000000",
  privateKey: "",
  bcSubscription: null,
  aavegotchiContract: null,
  ghstUpfrontCost: 0.1,
  borrower: 70,
  owner: 30,
  other: 0,
  gotchiId: gotchiId
}
