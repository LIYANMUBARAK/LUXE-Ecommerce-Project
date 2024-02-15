const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    minOrder: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        requird: true
    },
    expiryDate: {
        type: String,

    },
    totalUsage: {
        type: Number

    },
    maxDiscount: {
        type: Number,

    },
    usedUser: {
        type: Array

    },
})

module.exports = mongoose.model('Coupon', couponSchema)