const mailing = require('../service/mailing');
const Subscription = require('../model/subscription.js');

// Create and Save a new Note
exports.create = (req, res) => {
  const token = req.headers.authorization;
  // Create a Note
  const subscription = new Subscription({
    email: req.body.email || 'nodest@geekcowsd.com',
    subscribed: Date.now(),
    status: 'ACTIVE',
  });

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.body.content && req.body.email === undefined) {
    return res.status(400).send({
      message: 'Subscription content can not be empty',
    });
  }

  Subscription.findOne({ email: req.body.email })
    .then((nu) => {
      if (nu === null) {
        subscription.save()
          .then((data) => {
            mailing.subscription(data, res.locals.news);
            res.json(data);
          }).catch((err) => {
            res.status(500).send({
              message: err.message || 'Some error occurred while creating the entry.',
            });
          });
      } else {
        res.status(409).send({
          message: 'Already subscribed',
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

  res.locals.subscription.find({}, {}, query).sort({ email: -1 }).exec((err, subscription) => {
  // if there is an error retrieving, send the error otherwise send data
    if (err) {
      return res.send(err);
    }
    return res.json(subscription); // return all employees in JSON format
  });
  return false;
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
  const token = req.headers.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  Subscription.findById(req.params.id)
    .then((subscription) => {
      if (!subscription) {
        return res.status(404).send({
          message: `Cannot find id ${req.params.id}`,
        });
      }
      return res.json(subscription);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Cannot find id ${req.params.id}`,
        });
      }
      return res.status(500).send({
        message: `Error retrieving id ${req.params.id}`,
      });
    });
  return false;
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
  const token = req.headers.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.params.id) {
    return res.status(400).send({
      message: 'Note content can not be empty',
    });
  }

  Subscription.findByIdAndRemove(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: `Subscription not found with id ${req.params.id}`,
        });
      }
      return res.send({ message: 'Subscription deleted successfully!' });
    }).catch((err) => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Subscription not found with id ${req.params.id}`,
        });
      }
      return res.status(500).send({
        message: `Could not delete subscription with id ${req.params.id}`,
      });
    });
  return false;
};
