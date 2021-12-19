const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const itemsSchema = new Schema(
    {
        itemName: { type: String, required: true },
        expiryDate: {type: Date, required: true},
        brand: {type: String, required: true},
        imageURL: {type: String, required: true},
        quantity: {type: Number, required: true},
        price: {type: Number, required: true},
        favourite: {type: Boolean, required: true},
        // to add after group schema is created and done group:


    }
);




module.exports = mongoose.model('items', itemsSchema)