const dbCollection = require('./mongoConnection');

const getCollectionFn = (collection) => {
	let _col = undefined;

	return async () => {
		if (!_col) {
			const db = await dbCollection();
			_col = await db.collection(collection);
		}
		return _col;
	};
};

module.exports = {
	users: getCollectionFn('users'),
    logs: getCollectionFn('logs'),
    plans: getCollectionFn('plans'),
    reviews: getCollectionFn('reviews'),
    replies: getCollectionFn('replies')
};