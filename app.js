const express = require('express')
const app = express()
const configRoutes = require('./routes')
const exphbs = require('express-handlebars')
const cookie = require('cookie-parser')
const session = require('express-session')
const expressSanitizer = require('express-sanitizer')
const staticpage = express.static(__dirname + '/public')

app.use(cookie())
app.use(express.json())
app.use(expressSanitizer())
app.use('/public', staticpage)

// CORS support settings
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.use(session({
    name: 'UserInformation',
    secret: 'UserSecret',
    resave: false,
    saveUninitialized: true
}))

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === 'number')
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

app.use(express.urlencoded({extended: true}))
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.get('/', function (req, res, next) {
    req = req.sanitize(req.body)
    next()
})

configRoutes(app)

app.listen(3000, () => {
    console.log("We've now got a server!")
    console.log('Your routes will be running on http://localhost:3000')
})