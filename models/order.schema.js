const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    username:       {type: String,  required: true},
    productname:    {type: String,  required: true},
    itemcount:      {type: Number,  required: true},
    status:         {type: String,  default: "Order submitted"},
    iscompleated:   {type: Boolean, required: true},
},
{
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    collection: 'orders'
})

module.exports = orderSchema