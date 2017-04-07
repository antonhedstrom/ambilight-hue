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

const orientations = Object.keys(config.lightsMapping);
let hueClient;

module.exports = function tick(client) {
  // First time we call this client is set so lets store it for later use.
  if ( client ) {
    hueClient = client;
  }

  TV.getAmbilightData().then(data => {
    data = JSON.parse(data);
    const layer1 = data.layer1;
    const promises = [];
    // Left, right, ...
    orientations.forEach(orientation => {
      if ( layer1.hasOwnProperty(orientation) ) {
        let positions = config.lightsMapping[orientation];
        Object.keys(positions).forEach(pos => {
          if ( layer1[orientation].hasOwnProperty(pos) ) {
            let lights = positions[pos];
            lastTickLightsCounter = lights.length;
            lights.forEach((light, index) => {
              let promise = Hue.updateLight(hueClient, light.id, {
                rgb: layer1[orientation][pos]
              }).then(light => {
                // Noop
              }).catch(err => {
                console.error(err);
              });
              promises.push(promise);
            });
          }
        });
      }
    });
    Q.all(promises).then((lights) => {
      tick();
    });
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
