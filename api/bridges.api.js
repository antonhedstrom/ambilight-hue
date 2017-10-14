const express = require('express');
const router = express.Router();
const huejay = require('huejay');

const hueClient = require('../hue-client');

router.get('/', (req, res, next) => {
  huejay.discover().then(bridges => {
    res.send(bridges);
  }, error => {
    console.log(`An error occurred: ${error.message}`);
    next(error);
  });
});

router.post('/', (req, res, next) => {
  const body = req.body || {};
  const clientConfig = {
    host: body.ip
  };

  if ( body.username ) {
    clientConfig.username = body.username;
  }
  else {
    console.info('Waiting for user to press physical button...');
  }

  const client = hueClient.configureInstance(clientConfig);

  if ( !client ) {
    return next('Unable to create client');
  }

  res.send(client);
});

module.exports = router;
