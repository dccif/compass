const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', ((req, res) => {
    res.render('travel/restriction')
}))

module.exports = router;