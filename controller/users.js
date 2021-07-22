const User = require('../model/user.js');
const OauthUser = require('../model/oauthusers.js');
const UserLink = require('../model/user-links.js');
const mailing = require('../service/mailing');
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const fse = require('fs-extra');
const md5 = require('md5');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/var/www/html/illustrarama-assets/users/'+req.params.id);
    },
    filename: function (req, file, cb) {
        cb(null, md5(req.params.id) + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).single('image');

// Create and Save a new Note
exports.create = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (res.locals.user.role === "application" || res.locals.user.role === "admin") {
    //create an oauthuser
    const oauthuser = new OauthUser({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
      username: req.body.email,
      role: 'user'
    });

    OauthUser.findOne({ email: req.body.email }).then((nu) => {
        if (nu === null) {
          oauthuser.save()
            .then((data) => {
              const userData = data;

              const user = new User({
                userId: data._id.toString(),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                fbId: '',
                token: '',
                displayName: req.body.displayName,
                bio: '',
                shortDescription: '',
                enabled: true,
                image: '',
                type: req.body.type || 'VISITOR',
              });

              user.save()
                .then((nuser) => {
                  if (userData.addedContent === undefined) {
                    userData.addedContent = 1;
                  } else {
                    userData.addedContent += 1;
                  }
                  userData.displayName = nuser.displayName;
                }).catch((err) => {
                  userData.errors = err.message || 'With errors in user creation';
                });

              delete userData.password;
              //prepare welcome email
              mailing.welcome(userData);

              //return the user (not the oauthuser)
              res.json(userData);
            }).catch((err) => {
              res.status(500).send({
                message: err.message || 'Some error occurred while creating the entry.',
              });
            });
        } else {
          res.status(409).send({
            message: 'User already exists',
          });
        }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  }else{
    return res.status(401).json({"message":"Bad role"});
  }
};

exports.search = () => {

};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
  if (res.locals.user.role === "admin") {
    const perPage = 20;
    const page = req.query.page || 1;
    const query = {};

    res.setHeader('Content-Type', 'application/json');

    if (page < 0 || page === 0) {
      return res.status(422).send({
        message: 'invalid page number, should start with 1',
      });
    }
    query.skip = perPage * (page - 1);
    query.limit = perPage;

    res.locals.users.find({}, {}, query).sort({ email: -1 }).exec((err, users) => {
    // if there is an error retrieving, send the error otherwise send data
      if (err) {
        res.status(500);
      }
      res.json(users); // return all employees in JSON format
    });

    return false;
  }
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  let continueToDisplay = false;
  if (res.locals.user.role === "user" && req.params.id === res.locals.user.userId) {
    //view only one user
    continueToDisplay = true;
  } else {
    if (res.locals.user.role === "admin") {
      // view any user
      continueToDisplay = true;
    }
  }

  if (continueToDisplay) {
    const query = {'userId': req.params.id};
    User.findOne(query).then((nu) => {
        if (nu !== null) {
          res.json(nu);
        } else {
          res.status(409).send({
            message: 'Invalid user',
          });
        }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  } else {
    return res.status(401).json({"message":"Bad role"});
  }
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (res.locals.user.role === "user" && req.params.id === res.locals.user.userId) {
    //update user
    const query = {'userId': req.params.id};
    User.findOne(query).then((nu) => {
        if (nu !== null) {
          const newData = {
            userId: nu.userId,
            firstname: req.body.firstname || nu.firstname,
            lastname: req.body.lastname || nu.lastname,
            displayName: req.body.displayName || nu.displayName,
            bio: req.body.bio || nu.bio,
            shortDescription: req.body.shortDescription || nu.shortDescription
          };

          res.locals.users.findOneAndUpdate(query, newData, {upsert: true}, function(err, doc) {
              if (err) return res.send(500, {error: err});
              return res.status(200).json({"status":"Update success"});
          });
        } else {
          res.status(409).send({
            message: 'Invalid user',
          });
        }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  }else{
    return res.status(401).json({"message":"Bad role"});
  }
};

// Update a note identified by the noteId in the request
exports.upload = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (res.locals.user.role === "user" && req.params.id === res.locals.user.userId) {
    //update user
    fse.ensureDir('/var/www/html/illustrarama-assets/users/'+req.params.id, () => { // have removed err fronm this... add if needeed
      uploadImage(req,res,function(err){
        if(err){
           res.json({message:err});
           return;
        }

        const query = {'userId': req.params.id};
        User.findOne(query).then((nu) => {
            if (nu !== null) {
              const newData = {
                image:req.file.path.replace("/var/www/html/illustrarama-assets/","https://assets.illustrarama.com/")
              };

              res.locals.users.findOneAndUpdate(query, newData, {upsert: true}, function(err, doc) {
                  if (err) return res.send(500, {error: err});
                  return res.status(200).json({"status":"Update success"});
              });
            } else {
              res.status(409).send({
                message: 'Invalid user',
              });
            }
        }).catch((err) => {
          res.status(500).send({
            message: err.message || 'Some error occurred while creating the entry.',
          });
        });
      });
    });

  }else{
    return res.status(401).json({"message":"Bad role"});
  }
}

// Delete a note with the specified noteId in the request
exports.delete = () => {
  res.setHeader('Content-Type', 'application/json');

  if (res.locals.user.role === "user" || res.locals.user.role === "admin") {
    //delete from oauthuser

    //delete user

    //delete user references

    //delete user Content

    return res.status(200).json("ok");
  }else{
    return res.status(401).json({"message":"Bad role"});
  }
};

exports.addLink = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (res.locals.user.role === "user" && req.params.id === res.locals.user.userId) {
    //update user
    const query = {'userId': req.params.id};
    User.findOne(query).then((nu) => {
        if (nu !== null) {
          const userLink = new UserLink({
            name: req.body.name,
            url: req.body.url,
            type: req.body.type,
            description: req.body.description,
            userId: nu.userId,
          });

          userLink.save()
            .then((nUserLink) => {
              res.json(nUserLink);
            }).catch((err) => {
              const errors = err.message || 'With errors in content creation';
              res.status(400).json({error:errors})
            });

        } else {
          res.status(409).send({
            message: 'Invalid user',
          });
        }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  }else{
    return res.status(401).json({"message":"Bad role"});
  }
};

exports.getLinks = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (res.locals.user.role === "user" && req.params.id === res.locals.user.userId) {
    //update user
    const query = {'userId': req.params.id};
    User.findOne(query).then((nu) => {
        if (nu !== null) {
          res.locals.userLink.find(query, {}, {}).sort({ name: -1 }).exec((err, links) => {
          // if there is an error retrieving, send the error otherwise send data
            if (err) {
              res.status(500);
            }
            res.json(links); // return all employees in JSON format
          });
        } else {
          res.status(409).send({
            message: 'Invalid user',
          });
        }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  }else{
    return res.status(401).json({"message":"Bad role"});
  }
};
