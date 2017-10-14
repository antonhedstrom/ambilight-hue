
const Hue = require('./services/hue');

let hueClient;

module.exports = {
  configureInstance: function(config) {
    hueClient = Hue.createClient(config);
    return hueClient;
  },
  getInstance: function() {
    if ( !hueClient ) {
      throw Error('Configure client using configureInstance method before using it.');
    }
    return hueClient;
  }
};
