const mongoose = require('mongoose')

const aruSchema = new mongoose.Schema({
    nev: {type: String, required: true, unique: true},
        // a fenti paraméterek: string típusú érték, kötelező megadni, egyedinek kell lennie
    ar: {type: Number, required: true},
    darab: {type: Number, required: true}
},{collection: 'aruk'})

module.exports = aruSchema