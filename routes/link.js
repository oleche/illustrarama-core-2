const express = require('express');
const links = require('../controller/links.js');
const verifier = require('../middleware/authVerifier')

const router = express.Router();

router.use(verifier);

router.get('/:id', links.findOne);

router.delete('/:id', links.delete);

module.exports = router;
