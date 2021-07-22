const express = require('express');
const references = require('../controller/references.js');
const verifier = require('../middleware/authVerifier')

const router = express.Router();

router.use(verifier);

router.post('/', references.create);

router.get('/', references.findAll);

router.get('/:id', references.findOne);

router.put('/:id', references.update);

router.delete('/:id', references.delete);

module.exports = router;
