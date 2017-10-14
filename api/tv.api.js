const express = require('express');
const router = express.Router();
const _ = require('underscore');

const tvClient = require('../tv-client');
const Store = require('../services/store');

router.get('/', (req, res, next) => {
  const TV = tvClient.getInstance();
  TV.getSysInfo().then(data => {
    res.send(data);
  }, next);
});

router.post('/', (req, res, next) => {
  const options = {
    port: req.body.port,
    rootPath: req.body.rootPath
  };
  const client = tvClient.configureInstance(req.body.ip, options);
  Store.setData('tv-client', client).then(data => {
    console.log(`📺  ✅  Stored TV client: ${data}`, data["tv-client"]);
    res.send(client);
  }).catch(err => {
    console.log(`📺  ❌  Unable to store TV client: `, err);
    res.send(client);
  });
});

router.get('/ambilight', (req, res, next) => {
  const TV = tvClient.getInstance();
  TV.getAmbilightData().then(data => {
    res.send(data);
  }, next);
});

router.post('/ambilight/mode', (req, res, next) => {
  const newMode = req.body.mode;
  const TV = tvClient.getInstance();
  TV.setAmbilightMode(newMode).then(data => {
    res.send({
      status: 'success',
      data: data,
      msg: 'Mode updated.'
    });
  }, next);
});

// Return existing layers on current tv.
// Use ?active=true to filter only the layers that have data.
router.get('/ambilight/layers', (req, res, next) => {
  const TV = tvClient.getInstance();
  TV.getAmbilightData().then(data => {
    let layers = Object.keys(data).map(key => {
      return {
        name: key,
        cardinalDirs: Object.keys(data[key]).map(cardinalDir => {
          return {
            name: cardinalDir,
            indexes: Object.keys(data[key][cardinalDir]).length
          }
        })
      };
    });
    if ( req.query.active ) {
      layers = layers.map(layer => {
        layer.cardinalDirs = _.filter(layer.cardinalDirs, cardinalDir => {
          return cardinalDir.indexes > 0;
        });
        return layer;
      });
    }
    res.send(layers);
  }, next);
});


module.exports = router;
