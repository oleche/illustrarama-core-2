const http = require('http');
const axios = require('axios');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  var matches = token.match(/Bearer\s(\S+)/);

  if (!matches) {
    return res.status(401).send({auth:false, message:'Invalid request: malformed authorization header'});
  }

  const url = res.locals.database.oauth;

  axios.get(url, {
    headers: {
      'Authorization': `${token}`
    }
  })
  .then(response => {
    const headerDate = response.headers && response.headers.date ? response.headers.date : 'no response date';
    console.log('Status Code:', response.status);
    console.log('Date in Response header:', headerDate);

    res.locals.user = response.data;

    next();
  })
  .catch(err => {
    console.log('Error: ', err.message);
    return res.status(401).json(err.response.data);
  });
  //matches[1];
}
