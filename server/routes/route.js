const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('✅ WebSocket + CSV Server is alive!');
});

module.exports = router;
