const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    addres: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: false
    },
    pincode: {
        type: Number,
        required: false
    }
})

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {

        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    address: [addressSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    wallet:{
        type:Number,
        default:0
    }

})

module.exports = mongoose.model("User", userSchema)
