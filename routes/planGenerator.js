const express = require('express');
const router = express.Router();
const data = require('../data');
const planGenerator = data.planGenerator;
const xss=require("xss");

router.get('/make_plan', async (req, res) => {
    // res.getHeaders('Access-Control-Allow-Origin:*');
    // res.addHeader('Access-Control-Allow-Method:POST,GET');
    //  res.setHeader('Access-Control-Allow-Origin','*');
    //  res.setHeader('Access-Control-Allow-Method','GET');
    //console.log(res);
    res.render('plan/setPlan');
})

router.post('/generate_plan', async (req, res) => {
    try {
        //console.log(req.body);
        let list=xss(req.body.data);
        let sourceNodeList = JSON.parse(list);
        console.log(typeof sourceNodeList);
        let plan = await planGenerator.findLowestCostPlan(sourceNodeList);

        res.json({ plan: plan });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "service faild" });
    }
})

router.get('/getPlace/:searchTerm', async (req, res) => {
    try {
        let st=xss(req.params.searchTerm);
        let result = await planGenerator.getPoi(st);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.status(500);
    }
})

module.exports = router;