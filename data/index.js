const user = require('./users');
const review = require('./reviews');
const log = require('./logs');
const plan = require('./plans');
const reply = require('./replies');
const planGenerator = require('./planGenerator');
const guideline = require('./guidelines');
// const airport IATA
const cityQuery = require('./cityQuery');


module.exports = {
    users: user,
    reviews: review,
    logs: log,
    plans: plan,
    replies: reply,
    planGenerator: planGenerator,
    guideline: guideline,
    // airports
    cityQuery: cityQuery
};