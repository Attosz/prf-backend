const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

var userSchema = new mongoose.Schema({
    username:       { type: String, unique: true, required: true, lowercase: true },
    password:       { type: String, required: true },
    email:          { type: String, required: true },
    wallet:         { type: Number, default: 0 },
    accessLevel:    { type: String }
}, { collection: 'users' });

userSchema.pre('save', function (next) {
    const user = this;
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
    });
}; 

module.exports = userSchema