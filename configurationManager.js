const configuration = require('./configuration');
const fs = require('node:fs');


module.exports = {
  updateLendingParameters(ghstUpfrontCost, borrowerShare, ownerShare, otherShare, lendingDuration) {
    const configurationFile = './configuration.js';
    configuration.lendParameters.ghstUpfrontCost = ghstUpfrontCost
    configuration.lendParameters.borrower = borrowerShare
    configuration.lendParameters.owner = ownerShare
    configuration.lendParameters.other = otherShare
    configuration.lendParameters.time = lendingDuration
    fs.readFile(configurationFile, function(err, data) {
      if(err) throw err;
      data = data.toString();
      data = data.replace(/ghstUpfrontCost: .*,/g, `ghstUpfrontCost: "${ghstUpfrontCost}",`);
      data = data.replace(/borrower: .*,/g, `borrower: ${borrowerShare},`);
      data = data.replace(/owner: .*,/g, `owner: ${ownerShare},`);
      data = data.replace(/time: .*,/g, `time: ${lendingDuration},`);
      data = data.replace(/other: .*/g, `other: ${otherShare}`);
      fs.writeFile(configurationFile, data, function(error) {
        if(err) console.log(error)
      });
    });
  },
  toggleLendingListing(isToList) {
    const configurationFile = './configuration.js';
    fs.readFile(configurationFile, function(err, data) {
      if(err) throw err;
      data = data.toString();
      data = data.replace(/lending: .*,/g, `lending: ${isToList},`);
      fs.writeFile(configurationFile, data, function(error) {
        if(err) console.log(error)
      });
    });
    configuration.lending = isToList;
  }
}
