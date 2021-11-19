const mongoConnection = require('../config/mongoConnection');
//const data = require('../data');
const plan = require("../data/plans");
const user = require("../data/users");
const log = require("../data/logs");
let { ObjectId } = require('mongodb');
const { users } = require('../config/mongoCollections');

const main = async () => {
	try {
		//await user.removeAll();
		//First username is "travelplan", and the password is 123456
		const user1 = await user.insertUsers("travelplan", "Hello", "World", "12345678@xx.com", "$2a$16$vL75p8oSRlYjtf5n/zSkTu8acUPTjxm6ewmES5jfJikKJOxF2zfI2", "", [], [], "");
		const plan1_node = [{ id: 0, name: "The Palace Museum", location_id: "Beijing", duration: 90, coordinates: { latitude: 39.9163447, longtitude: 116.3971546 }, startDate:"2020-12-19T20:11:08.692Z" }, { id: 1, name: "Temple of Heaven", location_id: "Beijing", duration: 180, coordinates: { latitude: 39.8821803, longtitude: 116.4066056 }, startDate:"" }];
		const plan1 = await plan.insertPlans(user1, plan1_node);
		const plan2_node = [{ id: 0, name: "Time Square", location_id: "New York", duration: 100, coordinates: { latitude: 40.730610, longtitude: -73.935242 }, startDate:"2020-12-26T18:11:08.692Z" }, { id: 1, name: "Worls Trade Center", location_id: "New York", duration: 120, coordinates: { latitude: 40.730610, longtitude: -73.935242 }, startDate:"" }];
		const plan2 = await plan.insertPlans(user1, plan2_node);
		//const usersId = ObjectId(user1);
		//let myDate = new Date();
		//const date = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
		//const log1 = await log.insertLogs(usersId, "This is a wonderful trip!", plan1, "Beijing is a global city, and one of the world's leading centers for culture, diplomacy and politics, business and economics, education, language, and science and technology. A megacity, Beijing is the second-largest Chinese city by urban population after Shanghai and is the nation's cultural, educational, and political center.[15] It is home to the headquarters of most of China's largest state-owned companies and houses the largest number of Fortune Global 500 companies in the world, as well as the world's four biggest financial institutions.", "", date, 0, 0, plan1_node);
		//const plan2_node = [{ position: "Shanghai", arrival_time: "10/26/2020 8:00", departure_time: "11/01/2020 17:00", recommended_restaurants: ["871982708es312sesde3426"], recommended_residence: ["321982708es312sesde3222"] }];
		//const plan2 = await plan.insertPlans("871982708es312sesde3415", plan2_node);

		
	} catch (e) {
		console.log(e);
		const db = await mongoConnection();
		await db.serverConfig.close();
	}
	const db = await mongoConnection();
	await db.serverConfig.close();
};

main();