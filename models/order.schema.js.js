const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    username:       {type: String,  required: true},
    productname:    {type: String,  required: true},
    itemcount:      {type: Number,  required: true},
    date:           {type: Date,    },
    status:         {type: String,  default: "Order sent"},
    iscompleated:   {type: Boolean, required: true},
},
{
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    collation: 'orders'
})

module.exports = orderSchema