
const User = require("../models/userModel")
const bcrypt = require('bcrypt')

const accountSid = process.env.accountSid
const authToken = process.env.authToken
const verifySid = process.env.verifySid
const client = require("twilio")(accountSid, authToken)

const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const Wishlist = require("../models/wishlistModel")
const productModel = require("../models/productModel")
const { findOne } = require("../models/userModel")
const Order = require("../models/orderModel")
const Coupon = require("../models/couponModel")
const Banner = require("../models/bannerModel")


const crypto = require('crypto')
ObjectId = require('mongodb').ObjectID;
const moment = require('moment')


const Razorpay = require('razorpay');                                                 //razorpay
const { response } = require("../routes/userRoute");
const { env } = require("process")
const instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

const loginLoad = async (req, res) => {                                               //to load login page
    try {
        res.render('login')
    }
    catch {
        console.log(error.message)
    }
}

const homeLoad = async (req, res) => {                                                 //to load home page
    try {
        const bannerData = await Banner.find({})
        console.log(bannerData)
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            res.render('home', { user: userData, banner: bannerData })
        }
        else {
            res.render('home', { banner: bannerData })
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const registerLoad = async (req, res) => {                                              //to load register page
    try {
        res.render('registration')
    }
    catch {
        console.log(error.message)
    }
}

const verifyRegister = async (req, res) => {                                                           //new user registration
    try {
        const userDatas = await User.findOne({ mobile: req.body.mobile })
        const userDatasEmail = await User.findOne({ email: req.body.email })
        const password = req.body.password
        const sPassword = await bcrypt.hash(req.body.password, 10)
        const regex = /^(?=.*[@$!%*?&#+-])[@$!%*?&#+-\w]*$/
        if (req.body.name.trim() === "") {
            res.render('registration', { errMessage: "Enter Valid Name..." })

        }




        if (password.match(regex)) {


            if (req.body.password != req.body.rePassword) {
                res.render('registration', { errMessage: "Re-enter the correct password" })
            }
            else if ((req.body.password).length <= 8) {
                res.render('registration', { errMessage: "Enter minimum 8 characters for password" })
            }
            else if (req.body.name.trim() === "") {
                res.render('registration', { errMessage: "enter a valid name" })
            }
            else if (req.body.email.trim() === "") {
                res.render('registration', { errMessage: "enter a valid email" })
            }
            else if (req.body.mobile.trim() === "" || isNaN(req.body.mobile)) {
                res.render('registration', { errMessage: "enter a valid mobile number" })
            }
            else if (userDatas) {
                res.render('registration', { errMessage: "The entered Mobile number is already registered" })
            }
            else if (userDatasEmail) {
                res.render('registration', { errMessage: "The entered Email is already registered" })
            }

            else {

                // client.verify.v2
                //     .services("VA43ea507563db8841d37517b84b02eb3e")
                //     .verifications.create({ to: "+91" + req.body.mobile, channel: "sms" })
                //     .then((verification) => {
                        
                //         req.session.name = req.body.name
                //         req.session.email = req.body.email

                //         req.session.password = sPassword
                //         req.session.mobile = req.body.mobile
                //         req.session.register = true
                //         res.redirect('/verifyOTP')
                //     })
                // req.session.name = req.body.name
                //         req.session.email = req.body.email

                //         req.session.password = sPassword
                //         req.session.mobile = req.body.mobile
                //         req.session.register = true
                       

                    const hashedPassword = await bcrypt.hash(req.body.password,10)
                        const user = new User({
                            name: req.body.name,
                            email: req.body.email,
                            password: hashedPassword,
                            mobile: req.body.mobile

                        })

                        const userData = await user.save();

                        if (userData) {
                            req.session.user_id = userData._id
                            res.redirect('/home')
                        }
                        else {
                            res.render('registration', { errMessage: "Your registration have been failed" })
                        }
            }
        } else {
            res.render('registration', { errMessage: "Add special characters to password" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {                                                   //to verify the login
    try {
        const email = req.body.email
        const password = req.body.password
        if (email.trim() === "") {
            res.render('login', { errMessage: "Enter email" })
        }
        else if (password.trim() === "") {
            res.render('login', { errMessage: "Enter Password" })
        }
        else {

            const userData = await User.findOne({ email: email })
            if (userData) {

                const passwordMatch = await bcrypt.compare(password, userData.password)

                if (!passwordMatch) {
                    res.render('login', { errMessage: "Email or Password is Incorrect" })
                }


                else {
                    if (userData.status == false) {
                        res.render('login', { errMessage: "Sorry,you are blocked by the admin." })
                    }
                    else {
                        req.session.user_id = userData._id
                        res.redirect('/home')
                    }
                }
            }
            else {
                res.render('login', { errMessage: "User not registered" })
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadGetOTP = async (req, res) => {                                                        //to load get OTP page
    try {
        res.render('getOTP')
    } catch (error) {
        console.log(error.message)
    }
}

const getOTP = async (req, res) => {                                                            //to send OTP
    try {
        req.session.mobile = req.body.mobile
        const userData = await User.findOne({ mobile: req.body.mobile })
        if (userData) {
            req.session.user_id = userData._id
            client.verify.v2
                .services("VA43ea507563db8841d37517b84b02eb3e")
                .verifications.create({ to: "+91" + req.body.mobile, channel: "sms" })
                .then((verification) => {
                    res.redirect('/verifyOTP')
                })
        }
        else {
            res.render('getOTP', { errMessage: "not registered" })
        }
    } catch (error) {
        console.log(error.message)
    }
}


const loadVerifyOTP = async (req, res) => {                                                         //to load verify OTP page
    try {
        res.render('verifyOTP')
        console.log('verify');
    } catch (error) {
        console.log(error.message)
    }
}

const resendOTP = async (req, res) => {
    try {
        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: "+91" + req.session.mobile, channel: "sms" })
            .then((verification) => {
                console.log(verification.status)
                res.redirect('/verifyOTP')
            })
    }
    catch (error) {
        console.log(error.message);
    }

}


const verifyOTP = async (req, res) => {                                                             //to verify the OTP entered
    try {
        if (req.session.register) {

            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: "+91" + req.session.mobile, code: req.body.OTP })
                .then((verification_check) => {
                    console.log(verification_check.status)
                    if (verification_check.status === "approved") {
                        (async () => {
                            const user = new User({
                                name: req.session.name,
                                email: req.session.email,
                                password: req.session.password,
                                mobile: req.session.mobile

                            })

                            const userData = await user.save();

                            if (userData) {
                                req.session.user_id = userData._id
                                res.redirect('/home')
                            }
                            else {
                                res.render('registration', { errMessage: "Your registration have been failed" })
                            }
                        })()
                    } else {
                        res.render('verifyOTP', { errMessage: "Enter the correct OTP." })
                    }
                })


        }

        else {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: "+91" + req.session.mobile, code: req.body.OTP })
                .then((verification_check) => {
                    console.log(verification_check.status)
                    res.redirect('/home')
                })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadShop = async (req, res) => {                                                              //to load shop page
    try {
        // const categoryData = await Category.find({ is_disabled: false })
        const productData = await Product.find({ is_disabled: false })
        const menQuantity = await Product.find({ gender: "Men" })
        const womenQuantity = await Product.find({ gender: "Women" })
        const unisexQuantity = await Product.find({ gender: "Unisex" })
        const categoryData = await Category.aggregate([
            { $lookup: { from: Product.collection.name, localField: '_id', foreignField: 'category', as: 'products' } },
            { $project: { _id: 1, categoryName: 1, count: { $size: '$products' } } }]);
        if (req.session.user_id) {

            id = req.session.user_id

            const userData = await User.findById({ _id: id })

            res.render('shop', { product: productData, user: userData, category: categoryData, menQuantity, womenQuantity, unisexQuantity })
        }
        else {

            res.render('shop', { product: productData, category: categoryData, menQuantity, womenQuantity, unisexQuantity })
        }
    } catch (error) {
        error.message
    }
}

const logout = async (req, res) => {                                                        //to logout
    try {
        delete req.session.user_id
        res.redirect('/login')
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadProduct = async (req, res) => {                                                //to load the product page
    try {
        if (req.session.user_id) {
            const id = req.session.user_id
            const userData = await User.findById({ _id: id })
            const productData = await Product.findById({ _id: req.query.id }).populate('category')
            const relatedProducts = await Product.find({ category: productData.category._id, is_disabled: false, _id: { $ne: req.query.id } })
            res.render('singleProduct', { product: productData, user: userData, relatedProducts })
        }
        else {
            const productData = await Product.findById({ _id: req.query.id }).populate('category')

            const relatedProducts = await Product.find({ category: productData.category._id, is_disabled: false, _id: { $ne: req.query.id } })
            console.log(relatedProducts)
            res.render('singleProduct', { product: productData, relatedProducts })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadUserProfile = async (req, res) => {
    try {
        id = req.session.user_id
        const userData = await User.findById({ _id: id })
        res.render('userProfile', { user: userData })
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditUserProfile = async (req, res) => {
    try {
        id = req.session.user_id
        const userData = await User.findById({ _id: id })
        res.render('editUserProfile', { user: userData })
    } catch (error) {
        console.log(error.message);
    }
}

const loadCart = async (req, res) => {                                                                          //to load the cart page
    try {
        const id = req.session.user_id
        const cartData = await Cart.findOne({ userId: id })
        // console.log(cartData)
        const userData = await User.findById({ _id: req.session.user_id })
        if (cartData) {

            const productsId = cartData.product.map((data) => data.productId)
            const cartQuantity = cartData.product.map((data) => data.quantity)
            const totalPrice = cartData.product.map((data) => data.total)
            if (productsId) {
                const productsData = await Product.find({ _id: { $in: productsId } })
                console.log(productsData)
                res.render('cart', { user: userData, cartData, productsData, cartQuantity, totalPrice })
            }
            else {
                res.render('cart', { user: userData })
            }
        } else {
            const cart = new Cart({

                userId: req.session.user_id
            })
            const cartData = await cart.save()
            if (cartData) {
                res.render('cart', { user: userData })
            } else {
                console.log(error.message)
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editUserProfile = async (req, res) => {                                                           //to edit the user profile details
    try {
        const name = req.body.name
        const email = req.body.email
        const mobile = req.body.mobile
        const id = req.session.user_id
        const userData = await User.findById({ _id: id })
        if (name.trim() === "" || email.trim() === "" || mobile.trim() === "") {
            res.render('editUserProfile', { errMessage: "Enter Details", user: userData })
        }
        else {
            await User.findOneAndUpdate({ _id: id }, {
                $set: {
                    name: name,
                    email: email,
                    mobile: mobile
                }
            })
            res.redirect('/userProfile')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {                                                             //to add a product to cartf
    try {

        const productId = req.query.id
        const product = await Product.findOne({ _id: req.query.id })

        const quantity = 1
        const total = product.price
        const cartData = await Cart.findOne({ userId: req.session.user_id })
        if (cartData) {
            const cartProducts = cartData.product.map((data) => data.productId)
            const productExists = cartProducts.includes(productId)
            if (productExists) {
                const increaseQuantity = await Cart.updateOne({
                    userId: req.session.user_id,
                    "product.productId": productId
                },
                    { $inc: { "product.$.quantity": 1, "product.$.total": product.price } })
                res.redirect('/cart')
            } else {
                const addProductId = await Cart.updateOne({ userId: req.session.user_id }, { $push: { product: { productId, quantity, total } } })
                if (addProductId) {
                    res.redirect('/cart')
                } else {
                    console.log(error.message)
                }
            }
        } else {
            const cart = new Cart({
                product: [{
                    productId: req.query.id,
                    quantity: 1,
                    total: product.price
                }],
                userId: req.session.user_id
            })
            const cartData = await cart.save()
            if (cartData) {
                res.redirect('/cart')
            } else {
                console.log(error.message)
            }
        }

    }

    catch (error) {
        console.log(error.message);
    }
}

const deleteCartItem = async (req, res) => {                                            //to delete an item from the cart
    try {
        const id = req.session.user_id
        const productId = req.query.id
        await Cart.updateOne({ userId: id }, { $pull: { product: { productId } } })
        res.redirect('/cart')
    } catch (error) {
        console.error(error.message)
    }
}

const loadAddAddress = async (req, res) => {                                              //to load the add address page
    try {
        id = req.session.user_id
        const userData = await User.findById({ _id: id })

        res.render('addAddress', { user: userData })
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async (req, res) => {                                                                  //to add an address
    try {
        id = req.session.user_id
        const userData = await User.findById({ _id: id })
        const lettersOnly = /^[a-zA-Z]+$/;
        if (req.body.name.trim() === '' || req.body.email.trim() === "" || req.body.country.trim() === "" ||
            req.body.state.trim() === "" || req.body.address.trim() === "" || req.body.landmark.trim() === "" || req.body.pincode.trim() === "" || isNaN(req.body.mobile)
            || isNaN(req.body.pincode)) {
            res.render('addAddress', { user: userData, errMessage: "check all fields properly" })
        } else {

            const address = {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                country: req.body.country,
                state: req.body.state,
                addres: req.body.address,
                landmark: req.body.landmark,
                pincode: req.body.pincode,
            }

            const id = req.session.user_id
            const userAddress = await User.findOne({ _id: id }, { address: 1 })
            const user = await User.findOne({ _id: id })
            console.log(userAddress)
            console.log(userAddress.address)


            if (userAddress.address > 0) {
                user.address.push(address);
                user.save()
                res.redirect('/userProfile')
            }
            else {

                user.address.push(address);
                user.save()
                res.redirect('/userProfile')
            }
        }

    } catch (error) {
        console.log(error.message)
    }

}

const loadEditAddress = async (req, res) => {                                                                 //to load the edit address page
    try {
        const id = req.session.user_id
        const addressData = await User.findOne({ 'address._id': req.query.id }, { 'address.$': 1, _id: 0 })
     
        res.render('editAddress', { address: addressData.address })
    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async (req, res) => {                                                                     //to edit the address
    try {
        const id = req.session.user_id
     const updatedAddress={  name: req.body.name,
        email:req.body.email,
        mobile: req.body.mobile,
        country: req.body.country,
        state: req.body.state,
        addres: req.body.address,
        landmark: req.body.landmark,
        pincode: req.body.pincode
     }

     if (req.body.name.trim() === '' || req.body.email.trim() === "" || req.body.country.trim() === "" ||
     req.body.state.trim() === "" || req.body.address.trim() === "" || req.body.landmark.trim() === "" || req.body.pincode.trim() === "" || isNaN(req.body.mobile)
     || isNaN(req.body.pincode)) {
        const addressData = await User.findOne({ 'address._id': req.query.id }, { 'address.$': 1, _id: 0 })
        console.log(addressData)
        res.render('editAddress', { address: addressData.address ,errMessage:"Enter the fields correctly"})
     }else{
        const addressData = await User.updateOne({ _id: id, 'address._id': req.query.id }, {
            $set: {
                'address.$': updatedAddress
            }
        })
        console.log(addressData)
        res.redirect('/userProfile')
    }
} catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req, res) => {                                                                   //to delete an address
    try {
        const id = req.session.user_id
        const address = await User.updateOne({ _id: id }, { $pull: { address: { _id: req.query.id } } })
        console.log(address)
        res.redirect('/userProfile')
    } catch (error) {
        console.log(error.message);
    }
}

const changeQuantity = async (req, res) => {                                                                //to change the quantity of products in the cart
    try {
        const { userData, productId, quantity, id } = req.body;

        const cartData = await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId }, {
        })
        const product = cartData.product.find(item => item.productId == productId)

        const afterQuantity = product.quantity + Number(quantity);
        if (afterQuantity != 0) {
            if (quantity == 1) {
                await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId }, {
                    $inc: { 'product.$.quantity': quantity, 'product.$.total': req.body.salePrice }
                })
                res.json({ success: true })
            } else {
                await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId }, {
                    $inc: { 'product.$.quantity': quantity, 'product.$.total': -req.body.salePrice }
                })
                res.json({ success: false })
            }
        } else {
            await Cart.updateOne({ userId: req.session.user_id }, { $pull: { product: { productId } } })
            res.redirect('/cart')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async (req, res) => {                                                                         //to load the checkout page
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        const cartData = await Cart.findOne({ userId: userData._id })

        const productId = cartData.product.map((value) => { return value.productId })
        const productsData = await Product.find({ _id: productId })
        const product = cartData.product
        await Cart.updateOne({ userId: req.session.user_id }, { $unset: { coupon: "" } })
        let subtotal = 0
        // const productData = await Cart.findOne({productId:req.})
        for (let i = 0; i < product.length; i++) {
            subtotal = subtotal + product[i].total
        }

        res.render('checkout', { cartData: cartData.product, productsData, subtotal, cart: cartData, user: userData })
    } catch (error) {
        console.log(error.message)
    }
}

const orderSave = async (req, res) => {                                                         //to save the order details
    try {
        console.log(req.body);
        const id = req.session.user_id
        const cartData = await Cart.findOne({ userId: id })
        // const userData = await User.findOne({ _id: id })
        const addressId = req.body.address
        // const userId = req.session.user_id
        const cartProductId = cartData.product

        let total = 0;
        let discount = 0;
        for (let i = 0; i < cartProductId.length; i++) {
            total += cartProductId[i].total

        }
        const coupon = await Coupon.findOne({ _id: cartData.coupon })
        if (cartData.coupon) {

            if (coupon.type == "Percentage") {
                let couponPercentage = coupon.value
                let couponDiscount = couponPercentage / 100;

                discount = total * couponDiscount
                total = total - discount

            }
            else {
                discount = coupon.value
                total = total - coupon.value
            }
        }

        const orders = new Order({
            productData: cartProductId,
            userId: id,
            paymentMethod: req.body.paymentMethod,
            paymentStatus: "Pending",
            addresId: addressId,
            couponDis: discount,
            cartTotal: total,
            status: "Placed"
        })
        const orderDetailsSave = await orders.save()

        req.session.order_id = orderDetailsSave._id
        if (cartData.coupon) {
            await Coupon.updateOne({ _id: coupon._id }, { $push: { usedUser: req.session.user_id } })
            await Coupon.updateOne({ _id: coupon._id }, { $inc: { totalUsage: -1 } })

        }
        if (orderDetailsSave.paymentMethod == "Online Payment") {
            instance.orders.create({
                amount: parseInt(total) * 100,
                currency: "INR",
                receipt: orderDetailsSave._id.toString()
            }).then((order) => {


                res.json({ order });
            })
        } else {

            res.json({ success: true })
        }


        // const addressid=orderDetailsSave.addresId
        // const address = userData.address.id(addressid);
        // const orderData=await Order.findOne({_id:orderDetailsSave.id}).populate("productData.productId")
        // const productDatas=orderData.productData
        // console.log("product Name : "+productDatas[0].productId.productName);

        // if (orderDetailsSave) {
        //     res.render('confirmation',{order:orderDetailsSave,user:userData,address,productDatas})
        // }
        // else {
        //     res.redirect('/checkout')
        // }


    } catch (error) {
        console.error(error.message)
    }
}

const loadConfirmation = async (req, res) => {                                                                //to load confirmation page
    try {
        const orderId = req.session.order_id
        const orderData = await Order.findOne({ _id: orderId })
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        console.log(userData)
        const addressid = orderData.addresId
        // const address = userData.address.find(address=>address._id==addressid)
        const address = userData.address.id(addressid);


        const productOrderData = await Order.findOne({ _id: orderData.id }).populate("productData.productId")

        const productDatas = productOrderData.productData


        console.log(userData)
        console.log(address)
        console.log(productDatas)
        const cartData = await Cart.findOne({ userId: userId }).populate('product.productId')

        cartData.product.forEach((product) => {
            (async () => {
                await Product.findOneAndUpdate({ _id: product.productId }, { $inc: { stock: -(product.quantity) } })
            })()
        })
        cartData.product.splice(0, cartData.product.length)
        await cartData.save()

        res.render('confirmation', { order: orderData, user: userData, address, productDatas })

    } catch (error) {
        console.log(error.message);
    }
}
//to verify payment
const verifyPayment = async (req, res) => {
    try {
        console.log(req.body);
        const { order, payment } = req.body;
        let hmac = crypto.createHmac('sha256', '6PGGSfPJqLX35QV2BDdH1Tzm')
        hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest("hex")
        if (hmac == payment.razorpay_signature) {
            await Order.updateOne({ _id: order.receipt }, {
                $set: {
                    paymentStatus: 'Payed'
                }
            })
            res.json({ success: true })
        } else {
            await Order.updateOne({ _id: order.receipt }, {
                $set: {
                    paymentStatus: 'Failed'
                }
            })
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}


//to load wishlist
const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        const id = req.session.user_id
        const userData = await User.findById({ _id: id })
        const wishlistData = await Wishlist.findOne({ userId: id })

        if (!wishlistData) {
            const wishlist = new Wishlist({
                product: [],
                userId: userId

            })
            console.log(wishlist)
            await wishlist.save()
            res.render('wishlist', { user: userData, productData: 0 })
        }
        else {

            const productsId = wishlistData.product.map((data) => data.productId)

            const productsData = await Product.find({ _id: { $in: productsId } })

            res.render('wishlist', { user: userData, productsData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//to add items to wishlist

const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        const wishlistData = await Wishlist.findOne({ userId: userId })
        const productId = req.query.id
        const product = await Product.findOne({ _id: productId })
        const productid = product._id
        if (!wishlistData) {

            const productData = { productId: productId }
            const wishlist = new Wishlist({
                product: productData,
                userId: userId

            })
            console.log(wishlist)
            await wishlist.save()
        }
        else {



            const wishlistId = wishlistData._id
            console.log(wishlistId)
            const wishlistProducts = wishlistData.product.map((data) => data.productId)
            const productExists = wishlistProducts.includes(productId)
            if (productExists) {

                res.redirect('/home')
            }
            else {
                console.log("else")

                await Wishlist.findByIdAndUpdate({ _id: wishlistId }, { $push: { product: { productId: productid } } })
                res.redirect('/wishlist')
            }
        }

    } catch (error) {
        console.log(error.message)
    }
}

//to delete items from wishlist
const deleteWishlistItem = async (req, res) => {
    try {
        const id = req.query.id;
        await Wishlist.updateOne({ userId: req.session.user_id }, { $pull: { product: { productId: id } } })
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message)
    }
}

//to apply coupon
const applyCoupon = async (req, res) => {
    try {

        const { couponCode } = req.body;
        const couponDetails = await Coupon.findOne({ code: couponCode })
        const coupounApplied = await Cart.findOne({ $and: [{ userId: req.session.user_id }, { coupon: { $exists: true, $ne: null } }] })
        if (!coupounApplied) {
            const cartData = await Cart.findOne({ userId: req.session.user_id })
            let total = 0;
            for (let i = 0; i < cartData.length; i++) {
                total += cartData[i].total

            }
            console.log(total)
            if (couponDetails) {
                const userUsed = await Coupon.findOne({ $and: [{ usedUser: { $in: [req.session.user_id] } }, { code: couponCode }] })
                const expiryDate = new Date(couponDetails.expiryDate);
                let currentDate = new Date();
                if (userUsed) {
                    res.json({ success: true, couponDetails: couponDetails, userUsed: true })
                } else if (couponCode.totalUsage == 0) {
                    res.json({ success: true, couponDetails: couponDetails, totalUsageErr: true })
                } else if (expiryDate.getTime() < currentDate.getTime()) {
                    res.json({ success: true, couponDetails: couponDetails, expiryDateErr: true })
                } else if (couponDetails.minOrder > total) {
                    res.json({ success: true, couponDetails: couponDetails, minOrderErr: true })
                } else {
                    res.json({ success: true, couponDetails: couponDetails })
                    await Cart.updateOne({ userId: req.session.user_id },
                        { $set: { coupon: couponDetails._id } }, { upsert: true })
                }
            } else {
                res.json({ success: false })
            }
        } else {
            res.json({ success: false, applied: true })
            await Cart.updateOne({ userId: req.session.user_id }, {
                $unset: { coupon: "" }
            })
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

//to load order details page
const loadOrderDetails = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const id = req.session.user_id
        const orderData = await Order.find({ userId: id })
        console.log(orderData)
        const orderDate = orderData.map(value => {

            return moment(orderData.date).format("MMMM Do YYYY, h:mm:ss a");

        })

        res.render('orderDetails', { order: orderData, orderDate, user: userData })
    } catch (error) {
        console.log(error.message)
    }
}

//to cancel an order
const cancelOrder = async (req, res) => {
    try {
        orderId = req.query.id
        const orderData = await Order.findOne({ _id: req.query.id })
        await Order.findByIdAndUpdate({ _id: orderId }, { $set: { status: "Cancelled", paymentStatus: "Refunded" } })


        await User.findOneAndUpdate({ _id: req.session.user_id }, { $inc: { wallet: orderData.cartTotal } })

        res.redirect('/orders')
    } catch (error) {
        console.log(error.message)
    }
}

//to move a wishlist item to cart
const addToCartWishlistItem = async (req, res) => {
    try {
        const productId = req.query.id
        const product = await Product.findOne({ _id: req.query.id })
        const productid = product._id
        const quantity = 1
        const total = product.price
        const cartData = await Cart.findOne({ userId: req.session.user_id })
        const userId = req.session.user_id
        if (cartData) {
            const cartProducts = cartData.product.map((data) => data.productId)
            const productExists = cartProducts.includes(productId)
            if (productExists) {
                await Wishlist.updateOne({ userId: req.session.user_id }, { $pull: { product: { productId: productId } } })

                res.redirect('/cart')
            } else {
                const addProductId = await Cart.updateOne({ userId: req.session.user_id }, { $push: { product: { productId, quantity, total } } })

                if (addProductId) {
                    await Wishlist.updateOne({ userId: req.session.user_id }, { $pull: { product: { productId: productId } } })
                    res.redirect('/cart')
                } else {
                    console.log(error.message)
                }
            }
        } else {
            const cart = new Cart({
                product: [{
                    productId: req.query.id,
                    quantity: 1,
                    total: product.price
                }],
                userId: req.session.user_id
            })
            const cartData = await cart.save()
            if (cartData) {
                await Wishlist.updateOne({ userId: req.session.user_id }, { $pull: { product: { productId: productId } } })
                res.redirect('/cart')

            } else {
                console.log(error.message)
            }
        }



    }
    catch (error) {
        console.log(error.message)
    }
}

//to filter the products in shop page
const filter = async (req, res) => {
    try {
        const filters = req.body

        console.log(req.body)
        const condition = { is_disabled: false }
        var search = ""
        let sorted;
        if (filters.gender) {
            condition.gender = filters.gender
        }
        if (filters.category) {
            condition.category = { $in: filters.category }
        }
        if (filters.search) {
            search = filters.search
            condition.productName = { $regex: search, $options: 'i' }
        }
        if (filters.sort) {
            const sortCondition = filters.sort
            if (sortCondition == "highToLow") {
                sorted = { price: -1 }
            }
            else if (sortCondition == "lowToHigh") {
                sorted = { price: 1 }
            }
            else if (sortCondition == "alphabatically") {
                sorted = { productName: 1 }
            }
        }
        console.log(filters)
        if (filters.lowerPrice && filters.upperPrice) {
            condition.price = { $gte: filters.lowerPrice, $lte: filters.upperPrice }
        }
        console.log(condition)
        const productData = await Product.find(condition).sort(sorted)



        console.log("productData")
        res.json({ success: true, product: productData })
    } catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    loginLoad,
    homeLoad,
    registerLoad,
    verifyRegister,
    verifyLogin,
    loadGetOTP,
    loadVerifyOTP,
    getOTP,
    verifyOTP,
    loadShop,
    logout,
    loadProduct,
    loadUserProfile,
    loadEditUserProfile,
    loadCart,
    editUserProfile,
    addToCart,
    deleteCartItem,
    addAddress,
    loadAddAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
    changeQuantity,
    loadCheckout,
    loadConfirmation,
    orderSave,
    loadWishlist,
    addToWishlist,
    deleteWishlistItem,
    verifyPayment,
    applyCoupon,
    loadOrderDetails,
    cancelOrder,
    addToCartWishlistItem,
    filter,
    resendOTP
}