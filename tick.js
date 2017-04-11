const Q = require('q');

const config = require('./config.json');
const Hue = require('./services/hue');
const PhilipsTV = require('./services/philips-tv');
const TV = new PhilipsTV({
  ip: config.tv.server,
  port: config.tv.port,
  rootPath: config.tv.rootPath
});

let reconnectTries = 0;
let hueClient;
let cachedAmbilightData;

function fetchAmbilightData() {
  return TV.getAmbilightData().then(data => {
    cachedAmbilightData = JSON.parse(data);
    setTimeout(fetchAmbilightData, config.tv.pollInterval);
  }).catch(err => {
    if ( err.code === 'EHOSTUNREACH' ) {
      reconnectTries++;
      if ( reconnectTries === 1 ) {
        process.stdout.write('TV Unreachable ');
      }
      process.stdout.write('.');
      setTimeout(tick, Math.min(reconnectTries, 20) * 1000);
    }
    else {
      console.error(err);
    }
  });
}

function syncLight(id, layer, side, index) {
  if ( !cachedAmbilightData ) {
    setTimeout(syncLight.bind(this, id, layer, side, index), 500);
    return;
  }
  var ts = (new Date()).getTime();
  // TODO: Crossing fingers that all attributes exists
  var ambilightData = cachedAmbilightData[layer][side][index];
  Hue.updateLight(hueClient, id, {
    rgb: ambilightData
  }).then(light => {
    // Fetch again!
    var newTs = (new Date()).getTime();
    // console.log(`Updated Light#${id} after ${newTs - ts}msecs`);
    syncLight(id, layer, side, index);
  })
}

module.exports = function tick(client) {
  // First time we call this client is set so lets store it for later use.
  if ( client ) {
    hueClient = client;
  }

  fetchAmbilightData().then(data => {
    syncLight(3, 'layer1', 'left', 0);
    syncLight(4, 'layer1', 'left', 1);
    syncLight(5, 'layer1', 'right', 0);
    syncLight(6, 'layer1', 'right', 1);
    syncLight(7, 'layer1', 'left', 0);
  });

}
