const configuration = require('../../../configuration');
module.exports = {
  getGotchisNews() {
    let message = ""
    for (const gotchi of configuration.gotchis) {
      if (gotchi.isLent) {
        const timeRemaining = (gotchi.lendingDetails.timeAgreed * 1000 + gotchi.lendingDetails.period * 1000)
          - new Date().getTime()
        if (timeRemaining < 0) {
          message += `${gotchi.tokenId} should be claimed since ${timeRemaining / 1000 / 60 / 60} hour(s)\n`
        } else {
          message += `${gotchi.tokenId} is lent for ${timeRemaining / 1000 / 60 / 60} hour(s)\n`
        }
      } else if (gotchi.lendingDetails && gotchi.lendingDetails.timeAgreed === "0") {
        message += `${gotchi.tokenId} is listed but not lent\n`
      } else {
        message += `${gotchi.tokenId} is not listed\n`
      }
      if (gotchi.channel.isChannelable) {
        message += `${gotchi.tokenId} can be channeled !\n`
      } else {
        message += `${gotchi.tokenId} channel available in ${gotchi.channel.hourUntilNextChannel} hour(s)!\n`
      }
    }
    return message
  }
}
