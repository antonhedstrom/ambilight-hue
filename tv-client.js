const PhilipsTV = require('./services/philips-tv');
const defaultConfig = require('./config');

let TVClient;

module.exports = {
  configureInstance: function(ip, config = {}) {
    if ( !ip ) {
      throw Error('TV client: Missing required argument ip.');
    }
    config.ip = ip;
    TVClient = new PhilipsTV(config);

    return TVClient;
  },
  getInstance: function() {
    if ( !TVClient ) {
      throw Error('TV client is not configured. Please use app to do so.');
    }
    return TVClient;
  }
};
