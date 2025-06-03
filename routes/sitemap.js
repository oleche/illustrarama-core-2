const express = require('express');
const sitemap = require('../controller/sitemap.js');

const router = express.Router();

router.post('/', sitemap.upload);

module.exports = router;
