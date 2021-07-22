const express = require('express');
const user = require('../controller/users.js');
const verifier = require('../middleware/authVerifier')
const {body, validationResult} = require('express-validator');

const router = express.Router();

router.use(verifier);

router.post(
  '/',
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  user.create
);

router.post('/:id/upload', user.upload);

router.post('/:id/link', user.addLink);

router.get('/', user.findAll);

router.get('/:id', user.findOne);

router.get('/:id/link', user.getLinks);

router.put('/:id', user.update);

router.delete('/:id', user.delete);

module.exports = router;
