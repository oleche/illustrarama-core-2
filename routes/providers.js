const express = require('express');
const providers = require('../controller/providers.js');

const router = express.Router();

router.post('/', providers.create);

router.get('/', providers.findAll);

router.get('/:id', providers.findOne);

router.put('/:id', providers.update);

router.delete('/:id', providers.delete);

module.exports = router;
