const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const orderDetails = mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        require: true
    },
    total: {
        type: Number,
        required: true
    }
})

const orderSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    productData: [orderDetails],

    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    addresId: {
        type: ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    cartTotal: {
        type: Number,
        required: true
    },
    couponDis: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Order', orderSchema)