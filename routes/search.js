const express = require('express');
const news = require('../controller/news.js');

const router = express.Router();

router.get('/', news.search);

module.exports = router;
