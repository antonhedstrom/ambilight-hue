const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  const msg = 'Dude, I am alive!';
  res.format({
    json: function() {
      res.json({
        status: 'pong',
        msg
      });
    },
    default: function() {
      res.send(msg);
    }
  });
});

module.exports = router;
