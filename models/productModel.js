const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },  
    price: {
        type: Number,
        required: true
    },
    MRP:{
        type: Number,
        required:true
    },
    image: {
        type: Array
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: ObjectId,
        required: true,
        ref: 'Category'
    },
    gender: {
        type: String,
        required: true
    },
    is_disabled: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Product", productSchema)