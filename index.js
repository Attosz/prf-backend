const express = require('express')
const mongoose = require('mongoose')
const app = express()

const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const dbUrl = 'mongodb://localhost:27017'
mongoose.connect(dbUrl)

mongoose.connection.on('connected', () => { console.log('db connected') })
mongoose.connection.on('error', (err) => { console.log('db error', err) })

mongoose.model('aru', require('./models/arukereso.schema'))
mongoose.model('user', require('./models/user.schema'))

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
//ezzel a secrettel lesznek aláírva, hitelesítve a sütik, érdemes minél komplexebbet választani - vagyis nem ilyet, mint most én
app.use(session({ secret: 'prf2022', resave: true }));

//definiáljuk a lokális stratégiát
passport.use('local', new localStrategy(function (username, password, done) {
    const userModel = mongoose.model('user')
    //a passport hacsak nem rendelkezünk másképp, a req.body.username és a req.body.password mezőket keresi majd
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

app.listen(3000, () => {
    console.log('A szerver elindult')
})