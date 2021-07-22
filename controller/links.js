const UserLink = require('../model/user-links.js');

// Find a single note with a noteId
exports.findOne = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  UserLink.findById(req.params.id).then((nu) => {
    if (res.locals.user.role === "user" && nu.userId === res.locals.user.userId) {
      return res.json(nu);
    } else {
      return res.status(401).json({"message":"Bad role"});
    }
  }).catch((err) => {
    res.status(500).send({
      message: err.message || 'Some error occurred while deleting the entry.',
    });
  });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  UserLink.findById(req.params.id).then((nu) => {
    if (res.locals.user.role === "user" && nu.userId === res.locals.user.userId) {
      UserLink.findByIdAndRemove(req.params.id)
        .then((note) => {
          if (!note) {
            return res.status(404).send({
              message: `Link not found with id ${req.params.noteId}`,
            });
          }
          res.send({ message: 'Note deleted successfully!' });
          return;
        }).catch((err) => {
          if (err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
              message: `Link not found with id ${req.params.noteId}`,
            });
          }
          return res.status(500).send({
            message: `Could not delete link with id ${req.params.noteId}`,
          });
        });
    } else {
      return res.status(401).json({"message":"Bad role"});
    }
  }).catch((err) => {
    res.status(500).send({
      message: err.message || 'Some error occurred while deleting the entry.',
    });
  });
};
