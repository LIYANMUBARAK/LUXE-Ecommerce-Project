const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    productId: {
        type: String,
    },
    quantity: {
        type: Number
    },
    total: {
        type: Number
    }
})
const cartSchema = new mongoose.Schema({
    product: [productSchema],
    userId: {
        type: String
    },
    coupon: {
        type: ObjectId
    }
})

module.exports = mongoose.model('Cart', cartSchema)