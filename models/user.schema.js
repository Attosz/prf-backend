const mongoose = require('mongoose')
const bcrypt = require('bcrypt') //ennek a segítségével állítunk elő jelszó hasht

var userSchema = new mongoose.Schema({
    username:       { type: String, unique: true, required: true, lowercase: true },
    password:       { type: String, required: true },
    email:          { type: String, required: true },
    wallet:         { type: Number, default: 0 },
    accessLevel:    { type: String }
}, { collection: 'users' });

userSchema.pre('save', function (next) { // a dokumentum bizonyos eseményei előtt
    const user = this; // különböző műveleteket kódolhatunk le
    if (user.isModified('password')) {
        user.accessLevel = 'basic';
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next('Hiba a salt előállítása során')
            }
            bcrypt.hash(user.password, salt, function (error, hash) {
                if (error) {
                    return next('Hiba a hash előállítása során')
                }
                user.password = hash;
                return next();
            })
        })
    } else { return next() }
});

userSchema.methods.comparePasswords = function (password, nx) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        nx(err, isMatch);
    }); // hasheli a kapott jelszót is és csak a hasheket hasonlítja össze
}; // minden létrehozott és lekérdezett objektum a users kollekcióból rendelkezni fog ezzel a beépített metódussal


module.exports = userSchema