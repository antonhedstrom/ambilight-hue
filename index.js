const config = require('./config.json');
const startTick = require('./tick');
const Hue = require('./services/hue');
const Store = require('./services/store');

function init(hueClient) {
  Hue.listAllLights(hueClient).then(lights => {
    startTick(hueClient);
  });
}

Hue.connectBridge().then(bridge => {
  // Look for existing user
  Store.getData('client').then(data => {
    console.log(`Connect using existing user (${data.username.substring(0, 8)})...`);
    const client = Hue.createClient({
      host:     data.host,
      username: data.username
    });
    init(client);
  }, err => {
    // Create new user
    let client = Hue.createClient({
      host: bridge.ip
    });

    Hue.createUser(client).then((user) => {
      client.username = user.username;
      Store.setData('client', client.config).then(data => {
        console.log('Credentials stored as file.');
        init(client);
      });
    });

  }).catch(console.error);
}).catch(console.error);

