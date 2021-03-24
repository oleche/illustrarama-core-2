const express = require('express');
const news = require('../controller/news.js');

const router = express.Router();

router.post('/', news.create);

router.get('/', news.findAll);

router.get('/:id', news.findOne);

router.put('/:id', news.update);

router.put('/:id/vote', news.vote);

router.delete('/:noteId', news.delete);

module.exports = router;
