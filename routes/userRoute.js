const express = require("express")
const user_route = express()
const session = require("express-session")

const config = require("../config/config")

user_route.use(session({ secret: config.sessionSecret }))

const auth = require("../middleware/auth")
const userBlock = require("../middleware/userBlock")
const errorHandler = require("../middleware/errorHandler")

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))


user_route.use((req, res, next) => {
    res.set('cache-Control', 'no-store')
    next()
})

const userController = require("../controllers/userController")

user_route.get('/', userController.homeLoad)           //to load home page 
user_route.get('/home', userController.homeLoad)

user_route.get('/login', auth.isLogout, userController.loginLoad)     // to load login page
user_route.post('/login', userController.verifyLogin)

user_route.get('/logout', auth.isLogin, userController.logout)

user_route.get('/registration', auth.isLogout, userController.registerLoad) //to load register page     
user_route.post('/registration', userController.verifyRegister)             //to regiter user details

user_route.get('/getOTP', userController.loadGetOTP)                        //to load get OTP page
user_route.get('/verifyOTP', userController.loadVerifyOTP)                  //to load verify OTP page
user_route.get('/resendOTP', userController.resendOTP)

user_route.post('/getOTP', userController.getOTP)                           //to send OTP
user_route.post('/verifyOTP', userController.verifyOTP)                     //to verify OTP

user_route.get('/shop', userBlock.isBlocked, userController.loadShop)                            //to load shop page
user_route.get('/singleProduct', userBlock.isBlocked, userController.loadProduct)  //to load the product page

user_route.get('/userProfile', userBlock.isBlocked, auth.isLogin, userController.loadUserProfile)            //to load user Profile
user_route.get('/editUserProfile', userBlock.isBlocked, auth.isLogin, userController.loadEditUserProfile)    //to load edit user details
user_route.get('/cart', userBlock.isBlocked, auth.isLogin, userController.loadCart)                          //to load cart
user_route.get('/addToCart', userBlock.isBlocked, userController.addToCart)                                  //to add the product to cart
user_route.post('/editUserProfile', userBlock.isBlocked, userController.editUserProfile)                     //to edit the user details  

user_route.get('/deleteCartItem', userBlock.isBlocked, userController.deleteCartItem)                        //to delete the cart item

user_route.get('/addAddress', userBlock.isBlocked, auth.isLogin, userController.loadAddAddress)              //to load the add address page
user_route.post('/addAddress', userBlock.isBlocked, userController.addAddress)                               //to add address
user_route.get('/editAddress', userBlock.isBlocked, auth.isLogin, userController.loadEditAddress)            //to load the edit address page
user_route.post('/editAddress', userBlock.isBlocked, userController.editAddress)                             //to edit the address
user_route.get('/deleteAddress', userBlock.isBlocked, userController.deleteAddress)                          // to delete the address

user_route.post('/changeQuantity', userController.changeQuantity)                       //to change the quantity in cart

user_route.get('/checkout', userBlock.isBlocked, auth.isLogin, userController.loadCheckout)                  //to load checkout page
user_route.post('/checkout', userBlock.isBlocked, userController.orderSave)                                  //to save the order details
user_route.post('/verifyPayment', userBlock.isBlocked, userController.verifyPayment)
user_route.get('/confirmation', userBlock.isBlocked, auth.isLogin, userController.loadConfirmation)          //to load the order confirmation page

user_route.get('/wishlist', userBlock.isBlocked, auth.isLogin, userController.loadWishlist)                    //to load wishlist page
user_route.get('/addToWishlist', userBlock.isBlocked, auth.isLogin, userController.addToWishlist)              //to add a product to wishlist
user_route.get('/deleteWishlistItem', userBlock.isBlocked, userController.deleteWishlistItem)                 //to delete a product from wishlist

user_route.post('/applyCoupon', userController.applyCoupon)                                                  //to apply a coupon when checkout

user_route.get('/orders', userBlock.isBlocked, auth.isLogin, userController.loadOrderDetails)                  //to load order details page
user_route.get('/cancelOrder', userBlock.isBlocked, auth.isLogin, userController.cancelOrder)                  //to cancel an order

user_route.get('/addToCartWishListItem', userBlock.isBlocked, auth.isLogin, userController.addToCartWishlistItem) //to move a product from wishlist to cart
user_route.post('/filter', userController.filter)                                                            //to filter products in home page


user_route.use(errorHandler.errorHandler)

module.exports = user_route