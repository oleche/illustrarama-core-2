const express = require('express');
const news = require('../controller/subscriptions.js');

const router = express.Router();

router.post('/', news.create);

router.get('/', news.findAll);

router.get('/:id', news.findOne);

router.delete('/:id', news.delete);

module.exports = router;
