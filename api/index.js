const express = require('express');
const router = express.Router();

const bridgesRoutes = require('./bridges.api');
const lightsRoutes = require('./lights.api');
const tvRoutes = require('./tv.api');
const settingsRoutes = require('./settings.api');
const pingRoutes = require('./ping.api');

router.use('/bridges', bridgesRoutes);
router.use('/lights', lightsRoutes);
router.use('/tv', tvRoutes);
router.use('/settings', settingsRoutes);
router.use('/ping', pingRoutes);

// General Error handler
router.use((err, req, res, next) => {
  let description = err.message || 'Something broke!';
  let strDate = (new Date()).toString();
  res.status(500).format({
    json: function() {
      res.json({
        msg: description,
        date: strDate,
        method: req.method,
        path: req.originalUrl
      });
    },
    default: function() {
      res.send(`${strDate}: ${req.method} (${req.originalUrl})\n\r${description}`);
    }
  });
});

module.exports = router;

