const configuration = require('../configuration');
const discordClient = require('./discord/discordBotManager');
const axios = require('axios');

const MAP_ALTER_LEVEL_HOUR_BETWEEN_CHANNEL = {
1 : 24, 2 : 18, 3 : 12, 4 : 8, 5 : 6, 7 : 3, 8 : 2, 9 : 1
}
module.exports = {
  async populateParcelsInformations() {
    const query = `{parcels ( where: { id_in: [${configuration.parcels.map(parcel => '"'+parcel.tokenId+'"')}]}) {id equippedInstallations {level} lastChanneledAlchemica}}` //when available add restriction to get only altar (where: {alchemicaType: 0})
    const parcelsInformations = (await axios.post("https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-gotchiverse", { query: query })).data.data.parcels
    for(const parcel of configuration.parcels) {
      const parcelFetched = parcelsInformations.find(land => land.id === ""+parcel.tokenId)
      const lastChannelingDate = new Date(parcelFetched.lastChanneledAlchemica * 1000)
      let nextChannelingDate = new Date(lastChannelingDate.getTime())
      nextChannelingDate.setTime(nextChannelingDate.getTime() + MAP_ALTER_LEVEL_HOUR_BETWEEN_CHANNEL[parcelFetched.equippedInstallations[0].level] * 60 * 60 * 1000)
      const timeUntillNextChannel = (nextChannelingDate - new Date().getTime()) / 36e5;

      if (timeUntillNextChannel < 0 && !parcel.channel.isChannelable) discordClient.logTransaction(`Parcel ${parcel.tokenId} is ready for channel!`)
      parcel.channel = {isChannelable: timeUntillNextChannel < 0, hourUntilNextChannel: timeUntillNextChannel}
      console.log(configuration.parcels)
    }
  },
}


