const mongoCollections = require('../config/mongoCollections');
const replies = mongoCollections.replies;
let { ObjectId } = require('mongodb');

async function insertReplies(userId, reviewId, replyId, content, date) {
    const reply = await replies();
    const newInsert = {
        userId: userId,
        review: reviewId,
        replyId: replyId,
        content: content,
        date: date
    };
    const result = await reply.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function getById(id) {
    const reply = await replies();
    const data = ObjectId(id);
    const result = await reply.findOne({ _id: data });
    return result;
}

async function getByReviewId(id) {
	const reply = await replies();
	const data = await reply.find({ review: id });
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function getByUserId(id) {
	const reply = await rejplies();
	const data = await reply.find({ userId: id });
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function deleteById(id) {
	if (!id) throw 'The id has not been provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	const data = ObjectId(id);
	const reply = await replies();
	const result = await reply.deleteOne({ _id: data });
	if (result.deleteCount === 0) throw 'The reply does not exist.';
	if (result.deletedCount === 1)
		return true;
	else
		throw 'There is nothing in the collection.';
}

module.exports = {
    insertReplies,
    getById,
    deleteById,
	getByUserId,
	getByReviewId
}