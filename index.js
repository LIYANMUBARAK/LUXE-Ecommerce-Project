const mongoose = require("mongoose")
require('dotenv').config()
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_ATLAS)



const express = require("express")
const app = express()



//for user routes
const userRoute = require('./routes/userRoute')
app.use('/', userRoute);

//for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute)

const path = require("path");
app.use(express.static(path.join(__dirname, 'public')))

app.listen(3000, function () {
    console.log("Server is running...")
})