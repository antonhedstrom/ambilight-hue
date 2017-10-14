const express = require('express');
const router = express.Router();
const huejay = require('huejay');
const Q = require('q');

const hueService = require('../services/hue');
const attachHueClient = require('./middlewares/attach-client');
const lightsMappingCache = require('../lights-mapping-cache');

/*
Light Model
Light [${light.id}]: ${light.name}
  Type:             ${light.type}
  Unique ID:        ${light.uniqueId}
  Manufacturer:     ${light.manufacturer}
  Model Id:         ${light.modelId}
  Model:
    Id:             ${light.model.id}
    Manufacturer:   ${light.model.manufacturer}
    Name:           ${light.model.name}
    Type:           ${light.model.type}
    Color Gamut:    ${light.model.colorGamut}
    Friends of Hue: ${light.model.friendsOfHue}
  Software Version: ${light.softwareVersion}
  State:
    On:         ${light.on}
    Reachable:  ${light.reachable}
    Brightness: ${light.brightness}
    Color mode: ${light.colorMode}
    Hue:        ${light.hue}
    Saturation: ${light.saturation}
    X/Y:        ${light.xy[0]}, ${light.xy[1]}
    Color Temp: ${light.colorTemp}
    Alert:      ${light.alert}
    Effect:     ${light.effect}
*/

router.param('lightid', (req, res, next, lightid) => {
  // Ugly usage of middleware. Can't add as "usual" for router.param
  attachHueClient(req, res, err => {
    if ( err ) {
      return next(err);
    }

    res.locals.hueClient.lights.getById(lightid).then(light => {
      if ( light ) {
        light.tvPanel = lightsMappingCache.get('light-' + light.id) || {};
        req.light = light;
        next();
      }
      else {
        next(new Error('Can\'t find light with id ' + lightid));
      }
    }, next).catch(next);
  });
});

router.get('/', attachHueClient, (req, res, next) => {
  res.locals.hueClient.lights.getAll().then(lights => {
    if ( !lights ) {
      return next('Unable to fetch lights.');
    }
    const curriedLights = lights.map(light => {
      light.tvPanel = lightsMappingCache.get('light-' + light.id);
      return light;
    });
    res.send(curriedLights);
  }, error => {
    console.error('An error occurred:', error.stack);
    next(error);
  });
});

router.get('/:lightid', (req, res, next) => {
  res.send(req.light);
});

router.get('/:lightid/tvpanel', (req, res, next) => {
  const tvPanel = lightsMappingCache.get('light-' + req.light.id);
  res.send(tvPanel || {});
});

router.put('/:lightid', (req, res, next) => {
  const promises = [];
  const data = req.body;

  promises.push(hueService.updateLight(res.locals.hueClient, req.light.id, data).then(light => {
    return light;
  }, err => {
    next(`Can't update light ${req.params.lightid}`);
  }));

  if ( data.tvPanel ) {
    promises.push(new Promise((resolve, reject) => {
      const cachedValue = lightsMappingCache.put('light-' + req.light.id, data.tvPanel);
      if ( cachedValue ) {
        return resolve(cachedValue);
      }
      reject(`Unable to save tvPanel ${data.tvPanel}`);
    }));
  }

  Q.all(promises).then(values => {
    const lightData = values[0];
    const tvPanelData = values.length >= 2 ? values[1] : {};
    res.send(lightData);
  }, next);
});

module.exports = router;
