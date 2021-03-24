const express = require('express');
const showcase = require('../controller/showcase.js');

const router = express.Router();

router.get('/', showcase.findAll);

router.get('/:id', showcase.findOne);

router.put('/:id/vote', showcase.vote);

module.exports = router;
