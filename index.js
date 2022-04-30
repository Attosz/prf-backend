const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()

const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const envPort = process.env.PORT || 3000
//const dbUrl = 'mongodb://localhost:27017'
const dbUrl = 'mongodb+srv://admin:'+ process.env.DBPASS +'@prf-db.rf4hu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect(dbUrl)
mongoose.connection.on('connected', () => { console.log('db connected') })
mongoose.connection.on('error', (err) => { console.log('db error', err) })

mongoose.model('product', require('./models/products.schema'))
mongoose.model('order', require('./models/order.schema'))
mongoose.model('user', require('./models/user.schema'))

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(passport.initialize());
app.use(session({ secret: 'jguzvtulJUZFTDuijgbZTCzugJNiutrxOIjoUGtufIOJoizfZTFukh', resave: true, saveUninitialized: true}));
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'frontend/build')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render(pages.index))

const whitelist = "http://localhost:4200"

app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", whitelist)
    res.set("Access-Control-Allow-Credentials", "true")
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
        res.set("Access-Control-Allow-Headers", "Content-Type,X-Auth-Token,Origin")
        res.set("Access-Control-Max-Age", "3600")
    }
    next()
})

passport.use('local', new localStrategy(function (username, password, done) {
    const userModel = mongoose.model('user')
    userModel.findOne({ username: username }, function (err, user) {
        if (err) return done('Hiba lekeres soran', null);
        if (!user) return done('Nincs ilyen felhasználónév', null);
        user.comparePasswords(password, function (error, isMatch) {
            if (error) return done(error, false);
            if (!isMatch) return done('Hibas jelszo', false);
            return done(null, user);
        })
    })
}));

/* Ezek a következőt csinálják: ha megadjuk őket, akkor a req.logIn művelet során sessionbe,
munkafolyamatba léptetik a usert - a kliens kap egy sütit, ami ha a későbbi kéréseiben visszjön,
a passport egyből felismeri, hogy már bejelentkezett egyszer, illetve a req.user mezőn keresztül
el tudjuk majd érni azt az adatot, amit a serialize-nál a done() második paramétereként adtunk meg */
passport.serializeUser(function (user, done) {
    if (!user) return done('nincs megadva beléptethető felhasználó', null);
    return done(null, user);
});
passport.deserializeUser(function (user, done) {
    if (!user) return done("nincs user akit kiléptethetnénk", null);
    return done(null, user);
});

app.use('/', require('./routes'))
app.use('/subrouter-pelda', require('./routes'))

app.listen(envPort, () => {
    console.log('Server launched')
})