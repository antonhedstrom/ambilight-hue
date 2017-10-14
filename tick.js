const Q = require('q');

const config = require('./config.json');
const Hue = require('./services/hue');
const hueClient = require('./hue-client');
const tvClient = require('./tv-client');
const lightsMappingCache = require('./lights-mapping-cache');

let pollLightInterval = 100;

let reconnectTries = 0;
let cachedAmbilightData;

function fetchAmbilightData() {
  return tvClient.getInstance().getAmbilightData().then(data => {
    reconnectTries = 0;
    cachedAmbilightData = data;
    setTimeout(fetchAmbilightData, config.tv.pollInterval);
  }).catch(err => {
    if ( err.code === 'EHOSTUNREACH' ) {
      reconnectTries++;
      if ( reconnectTries === 1 ) {
        process.stdout.write('TV Unreachable ');
      }
      process.stdout.write('.');
      setTimeout(fetchAmbilightData, Math.min(reconnectTries, 20) * 1000);
    }
    else {
      console.error(err);
    }
  });
}

function syncLight(id, mapping) {
  // TODO: Crossing fingers that all attributes exists
  let ambilightData = cachedAmbilightData.layer1[mapping.side][mapping.index];
  let client = hueClient.getInstance();
  if ( !client ) {
    return;
  }
  Hue.updateLight(client, id, {
    rgb: ambilightData
  }).catch(err => {
    console.error('ERROR Updating light', id, err);
  });
}

function syncLights() {
  if ( !cachedAmbilightData ) {
    // No ambilight data, try later....
    setTimeout(syncLights, 10*1000);
    return;
  }
  const lightsMapping = lightsMappingCache.exportJson();
  Object.keys(lightsMapping).map(key => {
    if ( key.indexOf('light-') === 0 ) {
      const lightId = key.split('-')[1];
      syncLight(lightId, lightsMapping[key]);
    }
  })
}

function tick(client) {
  fetchAmbilightData().then(data => {
    syncLight(3);
    syncLight(4);
    syncLight(5);
    syncLight(6);
    syncLight(7);
  });

}

function updatePollLightInterval(interval) {
  return new Promise((resolve, reject) => {
    const newInterval = parseInt(interval, 10);
    if ( isNaN(newInterval) ) {
      reject('invalid argument. Expected number');
      return;
    }
    pollLightInterval = Math.max(100, newInterval);
    resolve(pollLightInterval);
  });
}

function getPollLightInterval() {
  return pollLightInterval;
}

module.exports = {
  tick,
  updatePollLightInterval,
  getPollLightInterval,
  syncLights,
  fetchAmbilightData
};

