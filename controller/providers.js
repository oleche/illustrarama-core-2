const Providers = require('../model/providers.js');

// Create and Save a new Note
exports.create = (req, res) => {
  const token = req.header.authorization;
  // Create a Note
  const provider = new Providers({
    name: req.body.name || 'Untitled',
    url: req.body.url || '',
    description: req.body.description || '',
    tag: req.body.tag || '',
    country: req.body.country || '',
    logo: req.body.country || '',
  });

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.body.tag) {
    return res.status(400).send({
      message: 'Provider can not be empty',
    });
  }

  Providers.findOne({ tag: req.body.tag })
    .then((nu) => {
      if (nu === null) {
        provider.save()
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
  const perPage = 20;
  const page = req.query.page || 1;
  const tg = req.query.tag;
  const query = {};

  res.setHeader('Content-Type', 'application/json');

  if (page < 0 || page === 0) {
    return res.status(422).send({
      message: 'invalid page number, should start with 1',
    });
  }
  query.skip = perPage * (page - 1);
  query.limit = perPage;

  if (!tg) {
    res.locals.providers.find({}, {}, query).sort({ name: -1 }).exec((err, providers) => {
    // if there is an error retrieving, send the error otherwise send data
      if (err) {
        res.status(500);
      }
      res.json(providers); // return all employees in JSON format
    });
  } else {
    Providers.findOne({ tag: tg })
      .then((providers) => {
        if (!providers) {
          return res.status(404).send({
            message: `Cannot find id ${tg}`,
          });
        }
        return res.json(providers);
      }).catch((err) => {
        if (err.kind === 'ObjectId') {
          return res.status(404).send({
            message: `Cannot find id ${tg}`,
          });
        }
        return res.status(500).send({
          message: `Error retrieving id ${tg}`,
        });
      });
  }
  return false;
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  Providers.findOne({ tag: req.params.tag })
    .then((providers) => {
      if (!providers) {
        return res.status(404).send({
          message: `Cannot find tag ${req.params.tag}`,
        });
      }
      return res.json(providers);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Cannot find tag ${req.params.tag}`,
        });
      }
      return res.status(500).send({
        message: `Error retrieving tag ${req.params.tag}`,
      });
    });
  return false;
};

// Update a note identified by the noteId in the request
exports.update = () => {

};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
  const token = req.header.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.body.content) {
    return res.status(400).send({
      message: 'Note content can not be empty',
    });
  }

  Providers.findByIdAndRemove(req.params.noteId)
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: `Note not found with id ${req.params.noteId}`,
        });
      }
      return res.send({ message: 'Note deleted successfully!' });
    }).catch((err) => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Note not found with id ${req.params.noteId}`,
        });
      }
      return res.status(500).send({
        message: `Could not delete note with id ${req.params.noteId}`,
      });
    });
  return false;
};
