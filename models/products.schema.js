const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:       {type: String, required: true, unique: true},
    price:      {type: Number, required: true},
    itemcount:  {type: Number, required: true}
},{collection: 'products'})

module.exports = productSchema