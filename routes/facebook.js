const express = require('express');
const facebook = require('../controller/facebooktoken.js');

const router = express.Router();

router.post('/', facebook.create);

router.get('/', facebook.findAll);

router.get('/:token', facebook.findOne);

router.delete('/:id', facebook.delete);

module.exports = router;
