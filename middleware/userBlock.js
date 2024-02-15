const User = require("../models/userModel")

const isBlocked = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            if (userData.status == false) {
                res.render('login', { errMessage: "Sorry,you are blocked by the admin" })
            } else {
                next()
            }

        } else {
            next()
        }

    }
    catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    isBlocked
}