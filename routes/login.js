const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const xss = require('xss');
const data = require('../data');
const { replies } = require('../config/mongoCollections');
const user = data.users;
const plan = data.plans;
const log = data.logs;
const review = data.reviews;
const reply = data.replies;

let globaltitle;
let globalfeel;
let globalreviews;

router.get('/', async (req, res) => {
	if (xss(req.session.username)) {
		await res.redirect('/login/personal');
	}
	else {
		await res.render('form/login', { errorMessage: null });
	}
});

router.get('/logs', async (req, res) => {
		await res.render('layouts/log', {});
});

router.get('/status', async (req, res) => {
	if (xss(req.session.username)) {
		const result = {};
		result.status = true;
		await res.json(result);
	}
	else {
		const result = {};
		result.status = false;
		await res.json(result);
	}
});

router.post('/makelog', async (req, res) => {
	const info = req.body;
	const userInfo = await user.getByUsername(req.session.username);
	const userId = userInfo._id;
	const logtitle = xss(info.logtitle);
	const logfeel = xss(info.logfeel);
	const planId = xss(info.id);
	let addition = {};
	//let array = [];
	const plan_location = await plan.getById(planId);
	//console.log(plan_location);
	//array = plan_location.nodes;
//console.log(plan_location);
	//for (let i of plan_location.nodes) {
		//array.push(i.position);
	//}
	addition.username = req.session.username;
	addition.plansLocation = plan_location.nodes;
	let myDate = new Date();
	const date = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
	const result = await log.insertLogs(userId, logtitle, planId, logfeel, '', date, 0, 0, addition);
	const result1 = {};
	result1.status = true;
	await res.json(result1);
});

router.post('/insertplans', async (req, res) => {
	if (xss(req.session.username)) {
		const info = req.body;
		const userInfo = await user.getByUsername(xss(req.session.username));
		const planList = info.planList;
		console.log(planList)
		const result = await plan.insertPlans(userInfo._id.toString(), planList);
		await res.json({});
	}
});

router.post('/makereview', async (req, res) => {
	if (xss(req.session.username)) {
		const info = req.body;
		const userInfo = await user.getByUsername(xss(req.session.username));
		const userId = userInfo._id;
		const logReview = xss(info.logReview);
		const logreviewId = xss(info.id);
	// 	let addition = {};
	// 	const array = [];
	// 	const plan_location = await plan.getById(planId);
	// //console.log(plan_location);
	// 	for (let i of plan_location.nodes) {
	// 		array.push(i.position);
	// 	}
	// 	addition.username = req.session.username;
	// 	addition.plansLocation = array;
		let myDate = new Date();
		const date = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
		const result = await review.insertReviews(userId, logreviewId, date, logReview, []);
		const result1 = {};
		result1.status = true;
		await res.json(result1);
	}
	else {
		await res.json({ status: false });
	}
});

router.get('/database/plans', async (req, res) => {
	if (xss(req.session.username)) {
		const userData = await user.getByUsername(req.session.username);
		const data = await plan.getByUserId(userData._id);
		let temp = [];
		let count = false;
		for (let j of data) {
			for (let i of userData.plansId) {
				if (j._id === i) {
					count = true;
				}
			}
			if (count === false) {
				temp.push(j._id);
			}
			count = false;
		}
		const result = await user.updateUser(userData._id.toString(), { plansId: temp });
		await res.json(data);
	}
});

router.post('/database/plansdelete', async (req, res) => {
	const id = xss(req.body.id);
	const userData = await plan.deleteById(id);
	await res.redirect('/login/personal/plans');
});

router.post('/database/logsdelete', async (req, res) => {
	if (xss(req.session.username)) {
		const id = xss(req.body.id);
		const userData = await log.deleteById(id);
		const userData1 = await user.getByUsername(xss(req.session.username));
		const temp = userData1.logsId;
		let array = [];
		for (let i of temp) {
			if (i !== id) {
				array.push(i);
			}
		}
		const result = await user.updateByArray(userData1._id.toString(), array);
		await res.redirect('/login/personal/logs');
	}
});

router.post('/database/reviewsdelete', async (req, res) => {
	if (xss(req.session.username)) {
		const id = xss(req.body.id);
		const userData = await review.deleteById(id);
		await res.redirect('/login/personal/logs');
	}
});

router.get('/database/logs', async (req, res) => {
	if (xss(req.session.username)) {
		const userData = await user.getByUsername(req.session.username);
		const data = await log.getByUserId(userData._id);
		await res.json(data);
	}
	//const userData = await log.getAllLogs();
	//await res.json(userData);
});

router.post('/database/reviews', async (req, res) => {
	if (xss(req.session.username)) {
		const data = await review.getById(xss(req.body.logId));
		for (let i of data) {
			const userData = await user.getById(i.userId);
			const name = userData.username;
			i.username = name;
		}
		await res.json(data);
	}
});

router.get('/database/getreviews', async (req, res) => {
	if (xss(req.session.username)) {
		const userData = await user.getByUsername(req.session.username);
		const data = await review.getByUserId(userData._id);
		for (let i of data) {
			i.addition = xss(req.session.username);
		}
		await res.json(data);
	}
});

router.get('/database/mainlogs', async (req, res) => {
	const userData = await log.getAllLogs();
	//console.log(userData);
	await res.json(userData);
});

router.post('/database/logsUpdate', async (req, res) => {
	//if (req.session.username) {
	const data1 = await review.getById(xss(req.body.logId));
	for (let i of data1) {
		const userData1 = await user.getById(i.userId);
		const name = userData1.username;
		i.username = name;
	}
	//}
	const id = xss(req.body.logId);
	let change = {};
	const data = await log.getById(id);
	let temp = req.body.reading + data.reading;
	let temp1 = req.body.like + data.like;
	if (req.session.username) {
		change = { reading: temp, like: temp1 };
		const userData = await log.updateLog(id, change);
		if (req.body.like) {
			const users = await user.getByUsername(xss(req.session.username));
			let arrayLiked = [];
			arrayLiked.push(id);
			const userData1 = await user.updateUser(users._id.toString(), { logsId: arrayLiked });
		}
		globaltitle = data.title;
		globalfeel = data.feel;
		globalreviews = data1;
		await res.json({ status: true });
	}
	else {
		change = { reading: temp };
		const userData = await log.updateLog(id, change);
		globaltitle = data.title;
		globalfeel = data.feel;
		globalreviews = data1;
		await res.json({ status: false });
	}
});

router.post('/database/replies', async (req, res) => {
	//if (req.session.username) {
		const data = await reply.getByReviewId(xss(req.body.reviewId));
		for (let i of data) {
			const userData = await user.getById(i.userId);
			const name = userData.username;
			i.username = name;
		}
		await res.json(data);
	//}
});

router.post('/database/writereplies', async (req, res) => {
	if (xss(req.session.username)) {
		const userData = await user.getByUsername(xss(req.session.username));
		const data = await review.getByReviewId(xss(req.body.reviewId));
		let myDate = new Date();
		const date = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
		const result = await reply.insertReplies(userData._id.toString(), xss(req.body.reviewId), '', xss(req.body.replyinput), date);
		await res.json({ status: true });
	}
	else {
		await res.json({ status: false });
	}
});

router.get('/personal', async (req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/personal', { username: xss(req.session.username) });
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/register', async(req, res) => {
	await res.render('form/register', {});
});

router.get('/personal/logs', async(req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/logs', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/plans', async(req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/plans', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/reviews', async(req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/reviews', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/account', async(req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/account', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/replies', async(req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/replies', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/likedlogs', async(req, res) => {
	if (xss(req.session.username)) {
		await res.render('form/likedlogs', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.post('/personal', async (req, res) => {
	const info = req.body;
	const userData = await user.getByUsername(xss(info.username));
	if (userData) {
		//const pass = userData.password;
		if (await bcrypt.compare(xss(info.password), userData.password)) {
		//if (info.password === pass) {
			req.session.username = xss(info.username);
			await res.render('form/personal', { username: userData.username, status: true });
		}
		else {
			await res.render('form/login', { errorMessage: 'The password is not correct.' });
		}
	}
	else {
		await res.render('form/login', { errorMessage: 'Your account does not exit. Please register first.' });
	}

});

router.post('/register', async (req, res) => {
	const info = req.body;
	//const userData = await user.getByLastName(info.lastNames);
	//const userData1 = await user.getByFirstName(info.firstNames);
	const userData = await user.getByUsername(xss(info.userNames));
	const userData1 = await user.getByEmail(xss(info.userEmails));
	if ((userData) || (userData1)) {
	//if ((userData.username === info.userNames) || (userData1.email === info.userEmails)) {
		req.session.username = xss(info.userNames);
		await res.render('form/personal', { username: xss(info.userNames), status: true });
	}
	else {
		if (xss(info.passwords) !== xss(info.confirms)) {
			await res.render('form/register', { compare: "The re-type password does not match.", status1: true });
		}
		else {
			await bcrypt.genSalt(16, function(err, salt) {
				bcrypt.hash(xss(info.passwords), salt, function(err, hash) {
					user.insertUsers(xss(info.userNames), xss(info.lastNames), xss(info.firstNames), xss(info.userEmails), hash, '', [], [], '');
				});
			});
			//user.insertUsers(info.lastNames, info.firstNames, hashPassword, null, null, null, null);
			await res.render('form/login', { registeredMessage: 'Your account has been registered.' });
		}
	}
});

router.get('/logout', async (req, res) => {
	await req.session.destroy();
	//await res.clearCookie('');
	await res.redirect('/login');
});

router.get('/personal/getlogs', async (req, res) => {
	await res.render('form/getlogs', { title: globaltitle, feel: globalfeel, reviews: globalreviews });
});

module.exports = router;