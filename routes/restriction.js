const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (req, res) => {
    res.render('travel/restriction')
})

router.post('/city', async (req, res) => {
    let cityQuery = req.body
    let restrictionInfo = await data.cityQuery.cityRestriction(cityQuery)
    if (restrictionInfo) {
        res.render('travel/restriction', {
            hasInfo: true,
            info: restrictionInfo
        })
    }
})

module.exports = router;