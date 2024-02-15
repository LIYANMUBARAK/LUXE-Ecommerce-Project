const express = require("express")
const admin_route = express()

const session = require("express-session")
const config = require("../config/config")
admin_route.use(session({ secret: config.sessionSecret }))

const bodyParser = require("body-parser")
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({ extended: true }))

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')

const auth = require("../middleware/adminAuth")

const adminController = require("../controllers/adminController")


admin_route.use((req, res, next) => {
    res.set('cache-Control', 'no-store')
    next()
})


const multer = require('multer')                                              //requiring multer and path modules
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/admin/ProductImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
})

const fileFilter = function (req, file, cb) {                                 //to filter only images to upload.
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('File type not supported'), false);
    }
    cb(null, true)
}



const upload = multer({ storage: storage, fileFilter: fileFilter })


admin_route.get('/login', auth.isLogout, adminController.loadLogin)         //to load login page
admin_route.get('/', auth.isLogout, adminController.loadLogin)

admin_route.get('/logout', auth.isLogin, adminController.logout)            //to logout

admin_route.post('/', adminController.verifyLogin)                          //to verify the login page
admin_route.post('/login', adminController.verifyLogin)

admin_route.get('/home', auth.isLogin, adminController.loadHome)           //to load dashboard



admin_route.get('/products', auth.isLogin, adminController.loadProductManagement)         //to load product page
admin_route.get('/categories', auth.isLogin, adminController.loadCategoryManagement)      //to load category management page
admin_route.get('/users', auth.isLogin, adminController.loadUserManagement)               //to load user management page

admin_route.get('/addProduct', auth.isLogin, adminController.loadAddProduct)               //to load add product page
admin_route.post('/addProduct', upload.array('images', 5), adminController.addProduct)    //to add a product
admin_route.get('/editProduct', auth.isLogin, adminController.loadEditProduct)             //to loaf edit product page

admin_route.get('/addCategory', auth.isLogin, adminController.loadAddCategory)             //to load add category page
admin_route.get('/editCategory', auth.isLogin, adminController.loadEditCategory)           //to load edit category page

admin_route.get('/blockUser', adminController.blockUser)                                  //to block user and unblock user
admin_route.get('/unblockUser', adminController.unblockUser)



admin_route.post('/addCategory', adminController.addCategory)                             //to add a category
admin_route.post('/editCategory', adminController.editCategory)                           //to edit a category
admin_route.get('/disableCategory', adminController.disableCategory)                        //to disable a category
admin_route.get('/enableCategory', adminController.enableCategory)                           //to enable a category

admin_route.get('/disableProduct', adminController.disableProduct)                          //to disable a product
admin_route.get('/enableProduct', adminController.enableProduct)                             //to enable a product
admin_route.get('/editProduct', auth.isLogin, adminController.loadEditProduct)             //to load edit product page
admin_route.post('/editProduct', upload.array('images', 5), adminController.editProduct)    //to edit product
admin_route.get('/deleteImage', adminController.deleteImage)                               //to delete image in edit product page
admin_route.get('/orders', auth.isLogin, adminController.loadOrderManagement)               //to load order management page 
admin_route.get('/orderDetails', auth.isLogin, adminController.loadOrderDetails)            //to load order details page
admin_route.get('/coupons', auth.isLogin, adminController.loadCouponManagement)             //to load coupon management page
admin_route.get('/addCoupon', auth.isLogin, adminController.loadAddCoupon)                  //to load add coupon page
admin_route.post('/addCoupon', auth.isLogin, adminController.addCoupon)                     //to add a coupon 

admin_route.get('/orderShipped', adminController.orderShipped)                             //to set the order status to order shipped
admin_route.get('/orderOutForDelivery', adminController.orderOutForDelivery)               //to set the order status to order out for delivery
admin_route.get('/orderDelivered', adminController.orderDelivered)                         //to set the order status to order delivered

admin_route.get('/banners', auth.isLogin, adminController.loadBannerManagement)             //to load banner management 
admin_route.get('/addBanner', auth.isLogin, adminController.loadAddBanner)                  //to load add banner page
admin_route.post('/addBanner', upload.single('images'), adminController.addBanner)          //to add a banner
admin_route.get('/editBanner', adminController.loadEditBanner)                             //to load edit banner page
admin_route.post('/editBanner', upload.single('images'), adminController.editBanner)        //to edit a banner
admin_route.get('/deleteBanner', adminController.deleteBanner)                             //to delete a banner
admin_route.get('/deleteBannerImage', adminController.deleteBannerImage)                   //to delete a banner image
admin_route.get('/salesReport', auth.isLogin, adminController.loadSalesReport)                           //to load sales report page

admin_route.post('/salesSearch', adminController.salesSearch)                                //to get sales report

admin_route.get('/graphDetails', adminController.graphDetails)                               //to pass graph details to admin dashboard

// admin_route.post('/downloadSalesReport',adminController.salesPdf)

module.exports = admin_route