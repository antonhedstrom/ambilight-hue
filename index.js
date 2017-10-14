const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const clc = require('cli-color');

const apiRoutes = require('./api');

const config = require('./config.json');
const tick = require('./tick');
const Hue = require('./services/hue');
const Store = require('./services/store');

const hueClient = require('./hue-client');
const tvClient = require('./tv-client');
const lightCache = require('./lights-mapping-cache');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan('dev'));

app.use(apiRoutes);

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
  console.log(clc.green(`🚃  EXPRESS APP STARTED AT PORT ${app.get('port')}`));

  readDataFromJSON().then(data => {
    tick.fetchAmbilightData().then(() => {
      tick.syncLights();
    });
  }, err => {
    console.error(err);
  });
});


function readDataFromJSON() {
  // Philips Hue connection (look for existing user)
  const huePromise = Store.getData('hue-client').then(data => {
    console.log(clc.yellow(`💡  Connect using existing user (${data.username.substring(0, 8)}...)`));
    hueClient.configureInstance({
      host: data.host,
      username: data.username
    }).bridge.get().then(bridge => {
      console.log(clc.green(`💡  Connected to ${bridge.name} (Zigbee Channel ${bridge.zigbeeChannel})`));
    });
    // Resolve with client
    return hueClient.getInstance();
  }).catch(err => {
    console.log(`💡  ❌  Missing Philips HUE credentials. Please use app to configure.`);
  });

  // Philips TV Ambilight connection
  const tvPromise = Store.getData('tv-client').then(data => {
    console.log(clc.yellow(`📺  Connecting to ${data.ip}:${data.port}...`));
    tvClient.configureInstance(data.ip, {
      id: data.id
    }).getSysInfo().then(data => {
      if ( data ) {
        console.log(clc.green(`📺  Connected to ${data.model}`));
      }
    }).catch(console.error);
    // Resolve with client
    return tvClient.getInstance();
  }).catch(err => {
    console.log(`📺  ❌  Missing TV Client info. Please use app to configure.`);
  });

  // Fill Light Mapping Cache with data from JSON.
  const mappingPromise = new Promise((resolve, reject) => {
    Store.getData('lights-mapping').then(data => {
      if ( !data ) {
        resolve({});
        return;
      }
      lightCache.importJson(data);
      console.log(clc.green(`⚡  Populated Light Cache from JSON file.`));
      resolve(data);
    }, err => {
      console.log(err);
      reject(err);
    });
  });

  return Promise.all([huePromise, tvPromise, mappingPromise]).then(values => {
    return {
      hue: values[0],
      tv: values[1],
      mapping: values[2]
    };
  });
}
