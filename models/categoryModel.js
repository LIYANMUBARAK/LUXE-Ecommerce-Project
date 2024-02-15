const { default: mongoose } = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    is_disabled: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Category", categorySchema)