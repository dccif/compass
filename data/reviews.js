const mongoCollections = require('../config/mongoCollections');
const reviews = mongoCollections.reviews;
let { ObjectId } = require('mongodb');

async function insertReviews(userId, logId, date, content, replies) {
    const review = await reviews();
    const newInsert = {
        userId: userId,
        logId: logId,
        date: date,
        content: content,
        replies: replies
    };
    const result = await review.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function getByReviewId(id) {
	const review = await reviews();
	const data = ObjectId(id);
    const result = await review.findOne({ _id: data });
    return result;
}

async function getById(id) {
    const review = await reviews();
	const result = await review.find({ logId: id });
	let result1 = await result.toArray();
	for (let i of result1) {
		i._id = i._id.toString();
	}
	return result1;
}

async function getByUserId(id) {
    const review = await reviews();
	const result = await review.find({ userId: id });
	let result1 = await result.toArray();
	for (let i of result1) {
		i._id = i._id.toString();
	}
	return result1;
}

async function getAllReviews() {
	const review = await reviews();
	const data = await review.find({});
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function updateReview(id, updated) {
	if (!id) throw 'The id has not provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	if (!updated) throw 'The update information has not been provided.';
	const data = ObjectId(id);
	const review = await reviews();
	let obj = {};
	if (updated.userId)
		obj.userId = updated.userId;
	if (updated.logId)
        obj.logId = updated.logId;
    if (updated.date)
        obj.date = updated.date;
    if (updated.content)
        obj.content = updated.content;
	if ((updated.replies) && (updated.replies.length !== 0)) {
		for (let i of updated.replies) {
			const result2 = await review.updateOne({ _id: data }, { $push: { replies: { $each: [i] } } });
		}
	}
	const result = await review.updateOne({ _id: data }, { $set: obj });
	const result1 = await review.findOne({ _id: data });
	result1._id = result1._id.toString();
	return result1;
}

async function deleteById(id) {
	if (!id) throw 'The id has not been provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	const data = ObjectId(id);
	const review = await reviews();
	const result = await review.deleteOne({ _id: data });
	if (result.deleteCount === 0) throw 'The review does not exist.';
	if (result.deletedCount === 1)
		return true;
	else
		throw 'There is nothing in the collection.';
}

module.exports = {
    insertReviews,
    getById,
    getAllReviews,
    updateReview,
	deleteById,
	getByReviewId,
	getByUserId
}