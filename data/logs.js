const mongoCollections = require('../config/mongoCollections');
const logs = mongoCollections.logs;
const users = require('./users');
let { ObjectId } = require('mongodb');

async function insertLogs(userId, title, planId, feel, reviews, date, like, reading, addition) {
    const log = await logs();
    const newInsert = {
        userId: userId,
        title: title,
        planId: planId,
        feel: feel,
        reviews: reviews,
        date: date,
        like: like,
		reading: reading,
		addition: addition
    };
    const result = await log.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function getById(id) {
    const log = await logs();
    const data = ObjectId(id);
    const result = await log.findOne({ _id: data });
    return result;
}

async function getByUserId(id) {
	const log = await logs();
	const data = await log.find({ userId: id });
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function getAllLogs() {
	const log = await logs();
	const data = await log.find({});
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function updateLog(id, updated) {
	if (!id) throw 'The id has not provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	if (!updated) throw 'The update information has not been provided.';
	const data = ObjectId(id);
	const log = await logs();
	let obj = {};
	let condition = false;
	if (updated.userId)
		obj.userId = updated.userId;
	if (updated.title)
        obj.title = updated.title;
    if (updated.planId)
        obj.planId = updated.planId;
    if (updated.feel)
        obj.feel = updated.feel;
	if ((updated.reviews) && (updated.reviews.length !== 0)) {
		for (let i of updated.reviews) {
			const result2 = await log.updateOne({ _id: data }, { $push: { reviews: { $each: [i] } } });
		}
	}
	if (updated.date)
        obj.date = updated.date;
    if (updated.like)
        obj.like = updated.like;
    if (updated.reading)
		obj.reading = updated.reading;
	for (var i in obj) {
		condition = true;
	}
	if (condition) {
		const result = await log.updateOne({ _id: data }, { $set: obj });
	}
	const result1 = await log.findOne({ _id: data });
	result1._id = result1._id.toString();
	return result1;
}

async function deleteById(id) {
	if (!id) throw 'The id has not been provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	const data = ObjectId(id);
	const log = await logs();
	const result = await log.deleteOne({ _id: data });
	if (result.deleteCount === 0) throw 'The log does not exist.';
	if (result.deletedCount === 1)
		return true;
	else
		throw 'There is nothing in the collection.';
}

module.exports = {
    insertLogs,
    getById,
    updateLog,
    deleteById,
	getAllLogs,
	getByUserId
}