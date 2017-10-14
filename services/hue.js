
const huejay = require('huejay');

const ColorHelpers = require('../helpers/color');
let intervalDelay = 1000; // ms

module.exports = {
  init: () => this.findBridges(),
  connectBridge: function() {
    return new Promise((resolve, reject) => {
      const searchBridge = () => {
        this.findBridges().then(bridges => {
          if ( bridges.length > 0 ) {
            resolve(bridges[0]);
          }
          else {
            intervalDelay *= 2;
            console.log('No bridge found... Trying again in ' + (intervalDelay / 1000) + 's');
            setTimeout(searchBridge, intervalDelay);
          }
        }).catch(reject);
      }

      searchBridge();
    });
  },
  findBridges: () => {
    return new Promise((resolve, reject) => {
      huejay.discover().then((bridges) => {
        if ( bridges.length > 0 ) {
          console.log('Available bridges:');
        }
        bridges.forEach((bridge) => {
          console.log(`    Id: ${bridge.id}, IP: ${bridge.ip}`);
        });
        resolve(bridges);
      }, (error) => {
        console.log(`An error occurred: ${error.message}`);
        reject(error);
      });
    });
  },
  createClient: function createClient(config) {
    return new huejay.Client(config);
  },
  createUser: function createUser(client) {
    const user = new client.users.User();
    user.deviceType = 'hue-and-ambilight';
    let pollButtonDelay = 300;

    return new Promise((resolve, reject) => {
      const buttonAuthentication = () => {

        client.users.create(user).then((user) => {
          console.log(`New user created - Username: ${user.username}`);
          resolve(user);
        }, (error) => {
          if (error instanceof huejay.Error && error.type === 101) {
            pollButtonDelay = pollButtonDelay < 3000 ? pollButtonDelay * 2 : 3000;

            console.log('Please press button on the Bridge...');
            setTimeout(buttonAuthentication, pollButtonDelay);
            return;
          }
          console.log(error);
        });
      };
      buttonAuthentication();
    });
  },
  listAllLights: client => new Promise((resolve, reject) => {
    client.lights.getAll().then((lights) => {
      lights.forEach((light) => {
        console.log(`Light [${light.id}]: ${light.name}`);
        // console.info(`  Type:             ${light.type}`);
        // console.info(`  Unique ID:        ${light.uniqueId}`);
        // console.info(`  Manufacturer:     ${light.manufacturer}`);
        // console.info(`  Model Id:         ${light.modelId}`);
        // console.info('  Model:');
        // console.info(`    Id:             ${light.model.id}`);
        // console.info(`    Manufacturer:   ${light.model.manufacturer}`);
        // console.info(`    Name:           ${light.model.name}`);
        // console.info(`    Type:           ${light.model.type}`);
        // console.info(`    Color Gamut:    ${light.model.colorGamut}`);
        // console.info(`    Friends of Hue: ${light.model.friendsOfHue}`);
        // console.info(`  Software Version: ${light.softwareVersion}`);
        // console.info('  State:');
        // console.info(`    On:         ${light.on}`);
        // console.info(`    Reachable:  ${light.reachable}`);
        // console.info(`    Brightness: ${light.brightness}`);
        // console.info(`    Color mode: ${light.colorMode}`);
        // console.info(`    Hue:        ${light.hue}`);
        // console.info(`    Saturation: ${light.saturation}`);
        if (light.xy) {
          console.info(`    X/Y:        ${light.xy[0]}, ${light.xy[1]}`);
        } else {
          console.info('    X/Y:        -');
        }
        // console.info(`    Color Temp: ${light.colorTemp}`);
        // console.info(`    Alert:      ${light.alert}`);
        // console.info(`    Effect:     ${light.effect}`);
      });
      resolve(lights);
    }, (error) => {
      console.log(`An error occurred: ${error.message}`);
      reject(error);
    });
  }),

  updateLight: (client, id, attrs) => new Promise((resolve, reject) => {
    client.lights.getById(id).then(light => {
      if ( !light.reachable || light.off ) {
        return;
      }
      if ( attrs.rgb ) {
        if ( light.colorMode === 'xy' ) {
          let xy = ColorHelpers.rgb_to_cie(attrs.rgb.r, attrs.rgb.g, attrs.rgb.b);
          // Light support XY format
          light.xy = [parseFloat(xy[0]), parseFloat(xy[1])];
        }
        // Delete rgb attribute since it is invalid
        delete attrs.rgb;
      }

      Object.keys(attrs).forEach(key => {
          light[key] = attrs[key];
      });

      return client.lights.save(light);
    }).then(resolve).catch(error => {
      console.log(error.stack);
      reject(error.stack);
    });
  })

};
