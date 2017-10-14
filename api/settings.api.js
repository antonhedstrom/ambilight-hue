const express = require('express');
const router = express.Router();
const huejay = require('huejay');

const tick = require('../tick');

router.get('/interval/lights', (req, res, next) => {
  res.json({
    interval: tick.getPollLightInterval(),
  });
});

router.get('/interval/lights/:number', (req, res, next) => {
  const interval = parseInt(req.params.number, 10);
  tick.updatePollLightInterval(interval).then(newInterval => {
    res.json({
      success: 'ok',
      newInterval
    });
  }).catch(res.send);
});

module.exports = router;
