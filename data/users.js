const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
let { ObjectId } = require('mongodb');

async function insertUsers(username, lastUserName, firstUserName, email, password, nickName, plansId, logsId, accImage) {
    const user = await users();
    const newInsert = {
        username: username,
        lastUserName: lastUserName,
        firstUserName: firstUserName,
        email: email,
        password: password,
        nickName: nickName,
        plansId: plansId,
        logsId: logsId,
        accountImage: accImage
    };
    const result = await user.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function updateUser(id, updated) {
	if (!id) throw 'The id has not provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	if (!updated) throw 'The update information has not been provided.';
	const data = ObjectId(id);
	const user = await users();
	let obj = {};
	let condition = false;
	if (updated.lastUserName)
		obj.lastUserName = updatedlastUserName;
	if (updated.firstUserName)
        obj.firstUserName = updated.firstUserName;
    if (updated.password)
        obj.password = updated.password;
    if (updated.nickName)
        obj.nickName = updated.nickName;
	if ((updated.plansId) && (updated.plansId.length !== 0)) {
		for (let i of updated.plansId) {
			const result2 = await user.updateOne({ _id: data }, { $push: { plansId: { $each: [i] } } });
		}
	}
	if ((updated.logsId) && (updated.logsId.length !== 0)) {
		for (let i of updated.logsId) {
			const result3 = await user.updateOne({ _id: data }, { $push: { logsId: { $each: [i] } } });
		}
	}
	for (var i in obj) {
		condition = true;
	}
	if (condition) {
		const result = await user.updateOne({ _id: data }, { $set: obj });
	}
	const result1 = await user.findOne({ _id: data });
	result1._id = result1._id.toString();
	return result1;
}

async function updateByArray(id, array) {
	if (!id) throw 'The id has not provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	if (!array) throw 'The update information has not been provided.';
	const data = ObjectId(id);
	const user = await users();
	const obj = {};
	obj.logsId = array;
	const result = await user.updateOne({ _id: data }, { $set: obj });
	return result;
}

// async function getByPassword(p) {
//     const user = await users();
//     const result = await user.findOne({ password: p });
//     return result;
// }

async function getByLastName(name) {
    const user = await users();
    const result = await user.findOne({ lastUserName: name });
    return result;
}

async function getByFirstName(name) {
    const user = await users();
    const result = await user.findOne({ firstUserName: name });
    return result;
}

async function getByUsername(name) {
    const user = await users();
	const data = await user.findOne({ username: name });
	return data;
}

async function getByEmail(email) {
    const user = await users();
	const data = await user.findOne({ email: email });
	return data;
}

async function getById(id) {
	const user = await users();
	const data = ObjectId(id);
    const result = await user.findOne({ _id: data });
    return result;
}

async function deleteById(id) {
	if (!id) throw 'The id has not been provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	const data = ObjectId(id);
	const user = await users();
	const result = await user.deleteOne({ _id: data });
	if (result.deleteCount === 0) throw 'The user does not exist.';
	if (result.deletedCount === 1)
		return true;
	else
		throw 'There is nothing in the collection.';
}

async function removeAll() {
	const user = await users();
	await user.deleteMany({});
}

module.exports = {
    insertUsers,
    //getByPassword,
    getByLastName,
    getByFirstName,
    getByUsername,
	getByEmail,
	getById,
    updateUser,
    deleteById,
	removeAll,
	updateByArray
};