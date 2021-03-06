const express = require('express');
const router = express.Router();
const data = require('../data');
const guideline = data.guideline;
const xss=require("xss");

router.get('/guideline', async (req, res) => {
   
    res.render('travelguideline/guideline');
})

router.post('/guideline', async (req, res) => {
    try {
        //console.log(req.body);
        let list=xss(req.body.data);
        let sourceNodeList = JSON.parse(list);
        console.log(typeof sourceNodeList);
        
        
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "service faild" });
    }
})

router.get('/travelguideline/iceland', async (req, res) => {
   
    res.render('travelguideline/iceland');
})

router.get('/travelguideline/norway', async (req, res) => {
   
    res.render('travelguideline/norway');
})

router.get('/travelguideline/canada', async (req, res) => {
   
    res.render('travelguideline/canada');
})



module.exports = router;