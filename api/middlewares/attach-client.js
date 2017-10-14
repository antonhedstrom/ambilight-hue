
const hueClient = require('../../hue-client');

module.exports = (req, res, next) => {
  const client = hueClient.getInstance();
  if ( !client ) {
    throw 'Couldn\'t find any Hue client.';
  }

  res.locals.hueClient = client;
  next();
};
