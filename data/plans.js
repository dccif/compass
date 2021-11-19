const mongoCollections = require('../config/mongoCollections');
const plans = mongoCollections.plans;
let { ObjectId } = require('mongodb');

async function insertPlans(userId, nodes) {
    const plan = await plans();
    const newInsert = {
        userId: userId,
        nodes: nodes
    };
    const result = await plan.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function getById(id) {
	const plan = await plans();
	const data = ObjectId(id);
    const result = await plan.findOne({ _id: data });
    return result;
}

async function getByUserId(id) {
	const plan = await plans();
	const data = await plan.find({ userId: id.toString() });
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function getAllPlans() {
	const plan = await plans();
	const data = await plan.find({});
	let result = await data.toArray();
	for (let i of result) {
		i._id = i._id.toString();
	}
	return result;
}

async function updatePlan(id, updated) {
	if (!id) throw 'The id has not provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	if (!updated) throw 'The update information has not been provided.';
	const data = ObjectId(id);
	const plan = await plans();
	let obj = {};
	if (updated.nodes[0].position)
		obj.position = updated.nodes[0].position;
	if (updated.nodes[0].arrival_time)
        obj.arrival_time = updated.nodes[0].arrival_time;
    if (updated.nodes[0].departure_time)
        obj.departure_time = updated.nodes[0].departure_time_time;
	if ((updated.nodes[0].recommended_restaurants) && (updated.nodes[0].recommended_restaurants.length !== 0)) {
		for (let i of updated.nodes[0].recommended_restaurants) {
			const result2 = await plan.updateOne({ _id: data }, { $push: { recommended_restaurants: { $each: [i] } } });
		}
	}
	if ((updated.nodes[0].recommended_residence) && (updated.nodes[0].recommended_residence.length !== 0)) {
		for (let i of updated.nodes[0].recommended_residence) {
			const result3 = await plan.updateOne({ _id: data }, { $push: { recommended_residence: { $each: [i] } } });
		}
	}
	const result = await plan.updateOne({ _id: data }, { $set: obj });
	const result1 = await plan.findOne({ _id: data });
	result1._id = result1._id.toString();
	return result1;
}

async function deleteById(id) {
	if (!id) throw 'The id has not been provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	const data = ObjectId(id);
	const plan = await plans();
	const result = await plan.deleteOne({ _id: data });
	if (result.deleteCount === 0) throw 'The plan does not exist.';
	if (result.deletedCount === 1)
		return true;
	else
		throw 'There is nothing in the collection.';
}

module.exports = {
    insertPlans,
    getById,
    updatePlan,
    deleteById,
	getAllPlans,
	getByUserId
}