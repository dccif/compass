const rootRoutes = require('.')
const priceRoutes = require('./priceQuery')
const login = require('./login');
const recommendPageRoutes = require('./recommendPage');
const planRoutes=require('./planGenerator');
const restriction = require('./restriction')

const constructorMethod = (app) => {
    app.use('/price', priceRoutes);
    app.use('/login', login);
    app.use('/recommend', recommendPageRoutes);
    app.use('/plan',planRoutes);
    app.use('/restriction',restriction)

    app.use('*', (req, res) => {
        res.redirect('/recommend')
    })
}
module.exports = constructorMethod