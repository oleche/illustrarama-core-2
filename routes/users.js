const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');

  res.locals.connection.query('SELECT * from users', (err, results) => {
    if (err) {
      res.send(JSON.stringify({ status: 500, error: err, response: null }));
      // If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({ status: 200, error: null, response: results }));
      // If there is no error, all is good and response is 200OK.
    }
  });
  return next();
});

module.exports = router;
