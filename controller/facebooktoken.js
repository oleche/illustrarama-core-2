const FacebookToken = require('../model/facebook-token.js');

// Create and Save a new Note
exports.create = (req, res) => {
  const token = req.headers.authorization;
  // Create a Note
  const facebookToken = new FacebookToken({
    token: req.body.token || '',
    expiration: req.body.expiration || Date.now(),
    expired: false,
    url: 'https://developers.facebook.com/tools/explorer/438661783871304/',
  });

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.body.token) {
    return res.status(400).send({
      message: 'Token can not be empty',
    });
  }

  FacebookToken.findOne({ token: req.body.token })
    .then((nu) => {
      if (nu === null) {
        facebookToken.save()
          .then((data) => {
            res.json(data);
          }).catch((err) => {
            res.status(500).send({
              message: err.message || 'Some error occurred while creating the entry.',
            });
          });
      } else {
        res.status(409).send({
          message: 'Duplicated entry',
        });
      }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  return false;
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
  const token = req.headers.authorization;

  const perPage = 20;
  const page = req.query.page || 1;
  const query = {};

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (page < 0 || page === 0) {
    return res.status(422).send({
      message: 'invalid page number, should start with 1',
    });
  }
  query.skip = perPage * (page - 1);
  query.limit = perPage;

  res.locals.facebooktoken.find({}, {}, query).exec((err, providers) => {
    // if there is an error retrieving, send the error otherwise send data
    if (err) {
      res.status(500);
    }
    providers.forEach((element, index, array) => {
      return res.json(element);
    })
    return res.json(providers); // return all employees in JSON format
  });
  return false;
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
  const token = req.headers.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  FacebookToken.findOne({ token: req.params.token })
    .then((providers) => {
      if (!providers) {
        return res.status(404).send({
          message: `Cannot find token ${req.params.token}`,
        });
      }
      return res.json(providers);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Cannot find token ${req.params.token}`,
        });
      }
      return res.status(500).send({
        message: `Error retrieving token ${req.params.token}`,
      });
    });
  return false;
};

// Update a note identified by the noteId in the request
exports.update = () => {

};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
  const token = req.headers.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.body.content) {
    return res.status(400).send({
      message: 'Note content can not be empty',
    });
  }

  FacebookToken.findByIdAndRemove(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: `Note not found with id ${req.params.id}`,
        });
      }
      return res.send({ message: 'Note deleted successfully!' });
    }).catch((err) => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Note not found with id ${req.params.id}`,
        });
      }
      return res.status(500).send({
        message: `Could not delete note with id ${req.params.id}`,
      });
    });
  return false;
};
