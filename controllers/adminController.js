const Admin = require("../models/adminModel")
const User = require("../models/userModel")
const Product = require("../models/productModel")
const Order = require("../models/orderModel")
const Category = require("../models/categoryModel")
const Coupon = require("../models/couponModel")
const Banner = require("../models/bannerModel")
const bcrypt = require('bcrypt');

const moment = require('moment')

const excelJS = require('exceljs')


const loadLogin = async (req, res) => {                           //to load login page
  try {
    if (req.session.admin_id) {
      res.redirect('/admin/home')
    }
    else {
      res.render('login')
    }
  }
  catch (error) {
    console.log(error.message)
  }
}


const verifyLogin = async (req, res) => {                             //to verify login
  try {

    if (req.body.email.trim() === "") {
      res.render('login', { errMessage: "Enter Email" })
    }
    else if (req.body.password.trim() === "") {
      res.render('login', { errMessage: "Enter Password" })
    }
    else {
      const email = req.body.email
      const password = req.body.password
      const adminData = await Admin.findOne({ email: email })
      console.log(adminData)

      if (adminData) {
        const passwordMatch = await bcrypt.compare(password, adminData.password)
        if (passwordMatch) {
          req.session.admin_id = adminData._id
          res.redirect('/admin/home')
        }
        else {
          console.log("password error");
          res.render('login', { errMessage: "Wrong Password" })
        }
      }
      else {
        console.log("wrong email")
        res.render('login', { errMessage: "Wrong Email" })
      }
    }
  }
  catch (error) {
    console.log(error.message)
  }
}


const loadHome = async (req, res) => {                                      //to load home page
  try {
    const productData = await Product.find({ is_disabled: false })
    const userData = await User.find({})
    const orderData = await Order.find({ status: { $ne: "Cancelled" } })
    const categoryData = await Category.find({})
    const payedOrder = await Order.find({ paymentStatus: "Payed" })
    console.log(payedOrder)
    let totalRevenue = 0;
    for (let i = 0; i < payedOrder.length; i++) {
      totalRevenue = totalRevenue + payedOrder[i].cartTotal
    }
    console.log(totalRevenue)
    res.render('home', { order: orderData, user: userData, product: productData, category: categoryData, totalRevenue })
  }
  catch (error) {
    console.log(error.message)
  }
}


const loadUserManagement = async (req, res) => {                            //to load user management
  try {
    const userdata = await User.find({})
    res.render('userManagement', { users: userdata })
  }
  catch (error) {
    console.log(error.message)
  }
}

const loadCategoryManagement = async (req, res) => {                        //to load category management
  try {
    const categoryData = await Category.find({})
    res.render('categoryManagement', ({ categories: categoryData }))
  }
  catch (error) {
    console.log(error.message)
  }
}


const loadProductManagement = async (req, res) => {                           //to load product management
  try {
    const productData = await Product.find({}).populate('category')


    res.render('productManagement', { product: productData })
  }
  catch (error) {
    console.log(error.message)
  }
}



const logout = async (req, res) => {                                            //to logout
  try {
    delete req.session.admin_id
    res.redirect('/admin/login')
  }
  catch (error) {
    console.log(error.message)
  }
}

const loadAddProduct = async (req, res) => {                                        //to load add product
  try {
    const categories = await Category.find({})


    res.render('addProductForm', { category: categories })
  } catch (error) {
    console.log(error.message)
  }
}

const addProduct = async (req, res) => {                                        //to add a product
  try {
    const productName = req.body.productName
    const price = req.body.price
    const discountPrice = req.body.discountPrice
    const stock = req.body.stock
    const gender = req.body.gender

    const description = req.body.description

    const categories = await Category.find({})

    if (productName.trim() == "" || price.trim() == "" || isNaN(price) || price <= 0 || stock <= 0
      || stock.trim() == "" || isNaN(stock) || gender.trim() == "" || description.trim() == "") {
      res.render('addProductForm', { errMessage: "check all fields properly", category: categories })
    }
    else {
      let imagesUpload = []
      for (let i = 0; i < req.files.length; i++) {
        imagesUpload[i] = req.files[i].filename
      }
      const products = new Product({
        productName: req.body.productName,
        price: req.body.price,
        MRP: req.body.MRP,
        stock: req.body.stock,
        gender: req.body.gender,
        image: imagesUpload,
        description: req.body.description,
        category: req.body.category,

      })

      const productData = await products.save()
      console.log(productData)
      if (productData) {
        res.redirect('/admin/products')
      }
      else {
        console.log(error.message)
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}




const loadAddCategory = async (req, res) => {                               //to load add category
  try {
    res.render('addCategoryForm')
  } catch (error) {
    console.log(error.message)
  }
}

const addCategory = async (req, res) => {                                     //to add a category
  try {
    const name = req.body.categoryName
    const categoryData = await Category.findOne({ categoryName: { $regex: '.*' + name + '.*', $options: 'i' } })
    console.log(categoryData)
    if (categoryData) {
      res.render('addCategoryForm', ({ errMessage: "Category already exists" }))
    }
    else if (name.trim() === "") {
      res.render('addCategoryForm', ({ errMessage: "Please enter a valid category name" }))
    }
    else {
      const category = new Category({
        categoryName: name
      })
      await category.save()

      res.redirect('/admin/categories')
    }

  }
  catch (error) {
    console.log(error.message)
  }
}

const loadEditCategory = async (req, res) => {                                          //to load edit category
  try {
    const categoryData = await Category.findById(req.query.id)
    res.render('editCategoryForm', { categories: categoryData.categoryName })
  } catch (error) {
    console.log(error.message)
  }
}

const editCategory = async (req, res) => {                                                //to edit a category

  try {
    const name = req.body.categoryName
    const categoryData = await Category.findOne({ categoryName: { $regex: '.*' + name + '.*', $options: 'i' } })
    if (categoryData) {
      res.render('editCategoryForm', { categories: categoryData.categoryName, errMessage: "Category already exists" })
    }
    else if (name.trim === "") {
      res.render('editCategoryForm', { categories: categoryData.categoryName, errMessage: "Please enter a valid category name" })
    }
    else {
      await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { categoryName: req.body.categoryName } })
      res.redirect('/admin/categories')
    }
  }
  catch (error) {
    console.log(error.message)
  }
}

const disableCategory = async (req, res) => {                                           //to disable a category
  try {
    await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { is_disabled: true } })
    const categoryData = await Category.findOne({ _id: req.query.id })
    const categoryId = categoryData._id
    await Product.updateMany({ category: categoryId }, { $set: { is_disabled: true } })
    res.redirect('/admin/categories')
  }
  catch (error) {
    console.log(error.message)
  }
}

const enableCategory = async (req, res) => {                                           //to enable a category
  try {
    await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { is_disabled: false } })
    res.redirect('/admin/categories')
  }
  catch (error) {
    console.log(error.message)
  }
}

const disableProduct = async (req, res) => {                                                       //to disable a product
  try {

    await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { is_disabled: true } })
    res.redirect('/admin/products')
  }
  catch (error) {
    console.log(error.message)
  }
}

const enableProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { is_disabled: false } })
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message)
  }
}

const loadEditProduct = async (req, res) => {                                         //to load edit product
  try {
    const productData = await Product.findById(req.query.id).populate('category')
    const categoryData = await Category.find({})
    console.log(productData);
    console.log(categoryData)
    console.log("edit load" + req.query.id);
    req.session.query = req.query.id
    res.render('editProductForm', { product: productData, category: categoryData })
  } catch (error) {
    console.log(error.message)
  }
}

const editProduct = async (req, res) => {                                             //to edit a product
  try {

    const productName = req.body.productName
    const price = req.body.price
    const stock = req.body.stock
    const gender = req.body.gender
    const description = req.body.description
    const category = req.body.category
    const productData = await Product.findById(req.query.id).populate('category')
    const categoryData = await Category.find({})

    if (productName.trim() == "" || price.trim() == "" || isNaN(price) || price <= 0 || stock <= 0
      || stock.trim() == "" || isNaN(stock) || gender.trim() == "" || description.trim() == "") {
      res.render('editProductForm', { errMessage: "Please Check the fields properly", product: productData, category: categoryData })
    }
    else {

      const imagesUpload = []
      for (i = 0; i < req.files.length; i++) {
        imagesUpload[i] = req.files[i].filename
      }
      await Product.findByIdAndUpdate({ _id: req.query.id }, {
        $set: {
          productName: req.body.productName, category: req.body.category,
          price: req.body.price, MRP: req.body.MRP, stock: req.body.stock, gender: req.body.gender,
          description: req.body.description, image: imagesUpload
        }
      })
      res.redirect('/admin/products')
    }
  } catch (error) {
    console.log(error.message);
  }
}


const blockUser = async (req, res) => {                                                       //to block a user
  try {
    console.log("block");
    const userData = await User.findById(req.query.id)
    console.log(userData)
    await User.findOneAndUpdate({ _id: req.query.id }, { $set: { status: false } })
    res.redirect('/admin/users')
  } catch (error) {
    error.message
  }
}


const unblockUser = async (req, res) => {                                                    //to unblock a user
  try {
    console.log("unblock")
    const userData = await User.findById(req.query._id)
    await User.findOneAndUpdate({ _id: req.query.id }, { $set: { status: true } })
    res.redirect('/admin/users')
  } catch (error) {
    error.message
  }
}

const deleteImage = async (req, res) => {                                                    //to delete an image in edit product page
  try {
    console.log("delete" + req.session.query);
    const imageUpdate = await Product.updateOne({ image: req.query.id }, { $pull: { image: { $in: [req.query.id] } } })
    console.log(imageUpdate);
    res.redirect('/admin/editProduct/?id=' + req.session.query)


  } catch (error) {
    console.log(error.message)
  }
}

//to load order management page
const loadOrderManagement = async (req, res) => {
  try {
    const orderData = await Order.find({})
    console.log(orderData)
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    const orderDate = orderData.map(value => {

      return moment(value.date).format("MMMM Do YYYY, h:mm:ss a");

    })
    res.render('orderManagement', { order: orderData, orderDate })
  } catch (error) {
    console.log(error.message)
  }
}

//to load order details page
const loadOrderDetails = async (req, res) => {
  try {
    orderId = req.query.id
    const orderData = await Order.findOne({ _id: orderId }).populate('productData.productId')

    const userData = await User.findOne({ _id: orderData.userId })

    const addressId = orderData.addresId.toString()


    const addressData = await userData.address.find(item => item._id == addressId)
    console.log(addressData)
    const productData = orderData.productData

    res.render('orderDetails', { orderData, productData, userData, addressData })
  } catch (error) {
    console.log(error.message)
  }
}

//to load coupon management page
const loadCouponManagement = async (req, res) => {
  try {
    const couponData = await Coupon.find({})

    res.render('couponManagement', { couponData })
  } catch (error) {
    console.log(error.message)
  }
}

//to load add coupon page
const loadAddCoupon = async (req, res) => {
  try {
    res.render('addCouponForm')
  } catch (error) {
    console.error(error.message)
  }
}

//to add a coupon
const addCoupon = async (req, res) => {
  try {
    const code = req.body.couponCode
    const type = req.body.couponType
    const value = req.body.value
    const minOrder = req.body.minOrder
    const expiryDate = req.body.expiryDate
    const totalUsage = req.body.totalUsage

    if (code.trim() === "" || type.trim() === "" || value.trim() == "" || minOrder.trim() == "" || totalUsage.trim() == ""
      || value <= 0 || minOrder <= 0 || expiryDate.trim() == "" || totalUsage <= 0) {
      res.render('addCouponForm', { errMessage: "Check all the fields properly" })
    }
    else {
      const couponDetails = new Coupon({
        code: req.body.couponCode,
        type: req.body.couponType,
        value: req.body.value,
        minOrder: req.body.minOrder,
        expiryDate: req.body.expiryDate,
        status: "active",
        totalUsage: req.body.totalUsage
      })
      if (couponDetails.type == "Percentage") {
        if (couponDetails.value > 100) {
          res.render('addCouponForm', { errMessage: "Enter a valid percentage value" })
        }
        else {
          await couponDetails.save()
          res.redirect('/admin/coupons')
        }
      } else {
        await couponDetails.save()
        res.redirect('/admin/coupons')
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}

//to set the order status to order shipped
const orderShipped = async (req, res) => {
  try {
    const orderId = req.query.id
    await Order.findByIdAndUpdate({ _id: orderId }, { $set: { status: "shipped" } })
    res.redirect('/admin/orders')
  }
  catch (error) {
    console.log(error.message)
  }
}

//to set the order status to order out for delivery
const orderOutForDelivery = async (req, res) => {
  try {
    const orderId = req.query.id
    await Order.findByIdAndUpdate({ _id: orderId }, { $set: { status: "Out For Delivery" } })
    res.redirect('/admin/orders')
  }
  catch (error) {
    console.log(error.message)
  }
}

//to set the order status to order delivered
const orderDelivered = async (req, res) => {
  try {
    const orderId = req.query.id
    await Order.findByIdAndUpdate({ _id: orderId }, { $set: { status: "Delivered" } })
    res.redirect('/admin/orders')
  }
  catch (error) {
    console.log(error.message)
  }
}

//to load banner management page
const loadBannerManagement = async (req, res) => {
  try {
    const bannerData = await Banner.find({})
    res.render('bannerManagement', { banner: bannerData })
  } catch (error) {
    console.error(error.message)
  }
}

//to load add banner page
const loadAddBanner = (req, res) => {
  try {
    res.render('addBannerForm')
  } catch (error) {
    console.log(error.message)
  }
}

//to add a banner
const addBanner = async (req, res) => {
  try {

    const { heading, description } = req.body

    if (heading.trim() === "") {
      res.render('addBannerForm', { errMessage: "Enter valid details" })
    }
    else {
      const bannerSave = new Banner({
        heading: heading,
        image: req.file.filename,
        description: description
      })
      bannerSave.save()
      console.log(bannerSave)
      res.redirect('/admin/banners')
    }
  } catch (error) {
    console.log(error.message)
  }
}

//to delete a banner
const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id
    await Banner.findByIdAndDelete({ _id: id })
    res.redirect('/admin/banners')
  }
  catch (error) { }
}

//to edit a banner
const editBanner = async (req, res) => {
  try {
    const heading = req.body.heading
    const description = req.body.description
    const id = req.query.id
    const bannerData = await Banner.findById({ _id: id })
    if (heading.trim() === "" || description.trim() === "") {
      res.render("editBannerForm", { errMessage: "Check the fields properly", banner: bannerData })
    }
    else {


      const id = req.query.id
      if (req.file) {
        await Banner.findByIdAndUpdate({ _id: req.query.id }, {
          $set: {
            heading: req.body.heading, description: req.body.description, image: req.file.filename
          }
        })
        res.redirect('/admin/banners')
      }
      else {
        await Banner.findByIdAndUpdate({ _id: req.query.id }, {
          $set: {
            heading: req.body.heading, description: req.body.description
          }
        })
        res.redirect('/admin/banners')
      }
    }
  }
  catch (error) { }
}

//to load edit banner page
const loadEditBanner = async (req, res) => {
  try {
    const id = req.query.id
    const bannerData = await Banner.findById({ _id: id })
    res.render('editBannerForm', { banner: bannerData })
  } catch (error) {
    console.log(error.message)
  }
}

//to delete a banner image
const deleteBannerImage = async (req, res) => {
  try {
    console.log(req.query.bannerid)
    await Banner.updateOne({ _id: req.query.bannerid }, { $pull: { image: { $in: [req.query.id] } } })
    res.redirect('/admin/editBanner?id=' + req.query.bannerid)
  }
  catch (error) {

  }
}

//to load sales report
const loadSalesReport = async (req, res) => {
  try {
    const sales = await Order.find({ status: "Delivered" }).populate('userId').populate('productData.productId')
    let formattedDate = []
    const salesDetails = sales.forEach((sales, index) => {
      const date = new Date(sales.date)
      formattedDate = date.toISOString().slice(0, 10);

    })
    const salesDate = sales.map(value => {

      return moment(value.date).format("MMMM Do YYYY, h:mm:ss a");

    })
    console.log(formattedDate)
    res.render('salesReport', { sales, salesDetails, formattedDate, salesDate })

  } catch (error) {
    console.log(error.message)
  }
}

//to search the sales to display in sales report
const salesSearch = async (req, res) => {
  try {

    const date = req.body
  
    const dateFrom = new Date(date.dateFrom)
    const dateTo = new Date(date.dateTo)



 
  const sales = await Order.find({ $and: [{ date: { $gte: dateFrom } }, { date: { $lte: dateTo } }, { status: "Delivered" }] }).populate('userId').populate('productData.productId')
  console.log(sales)  

  res.json({ success: true, sales: sales })
  
 
  } catch (error) {
    console.error(error.message)
  }
}

const graphDetails = async (req, res, next) => {
  try {
    const currentDate = moment();

    // Subtract six months
    const sixMonthsAgo = moment().subtract(6, 'months');

    // Create an array to hold the six months
    const lastSixMonths = [];
    const orderSalesCount = []
    const totalUserCount = []
    const paymentTotal = []

    // orderFind isdelivered only
    const orderData = await Order.find({ status: "Delivered" }).populate('productData.productId')
    const orderCount = orderData.length;

    const totalProducts = orderData.reduce((acc, order) => {
      const productDetails = order.productData.length
      return acc + productDetails;
    }, 0)
    const categories = await Category.find({ status: true })
    const categoryNames = [];
    const categoryPerc = [];
    categories.forEach((category) => {
      const categoryCount = orderData.reduce((acc, order) => {
        const productDetails = order.productData;
        const categoryCount = productDetails.filter(details => details.productId.category.includes(category.categoryName)).length;
        return acc + categoryCount;
      }, 0)
      const categoryPercentage = (categoryCount / totalProducts) * 100;
      categoryNames.push(category.categoryName)
      categoryPerc.push(categoryPercentage)
    })

    // Loop through the months and add them to the array
    const startDate = moment().subtract(6, 'months').startOf('month');
    const endDate = moment().endOf('month');


    for (let date = moment(sixMonthsAgo); date.diff(currentDate, 'months') <= 0; date.add(1, 'month')) {
      lastSixMonths.push(date.format('MMM'));
      const monthStart = moment(date).startOf('month');
      const monthEnd = moment(date).endOf('month');


      //order count
      const monthOrders = orderData.filter(order => moment(order.date).isBetween(monthStart, monthEnd));
      const OrderCount = monthOrders.length;
      orderSalesCount.push(OrderCount);

      //user count
      const monthUsers = monthOrders.map(order => order.userId);
      const userCount = monthUsers.length;
      totalUserCount.push(userCount);

      // payment price count
      const monthPayments = monthOrders.map(order => order.cartTotal).reduce((acc, cur) => acc += cur, 0);
      paymentTotal.push(monthPayments)


      startDate.add(1, 'month');
      endDate.subtract(1, 'month');
    }

    //for order statitics
    const categoryList = [];

    // Print the array of six months

    console.log(orderSalesCount)
    console.log(totalUserCount)
    console.log(paymentTotal)
    res.json({ orderSalesCount, lastSixMonths, totalUserCount, paymentTotal, categoryNames, categoryPerc, })



  } catch (error) {
    next(error)
  }
}


//exportpdf
// const salesPdf = async(req,res,next)=>{
//   try {

//       const workbook = new excelJS.Workbook();
//       const worksheet = workbook.addWorksheet('Sales Report')

//       worksheet.columns = [

//           { header: "NAME", key: "name" },
//           { header: "PRODUCT DETAILS", key: "productDetails" },
//           { header: "QUANTITY", key: "quantity" },
//           { header: " DATE", key: "date" },
//           { header: "PRICE", key: "totalPrice" },
//           { header: " PAYMENT MODE", key: "paymentMode" }


//       ];

//       const start = req.body.dateFrom;
//       const end = req.body.dateTo;
//       const orderData = await Order.find({ status: "Delivered", date: { $gte: start, $lte: end } }).sort({ date: 'desc' }).populate('userId').populate('productData.productId')
//       console.log(orderData)


//       for (let i = 0; i < orderData.length; i++) {
//           const customerName = orderData[i].userId.name;
//           const productId = orderData[i].productData.map(item=>item.productId);
//           const quantityTotal = orderData[i].productData.map(item=>item.quantity);
//           const productName=[]
//           const quantity =[]
//           for (let i= 0;i<productId.length;i++){
//               productName [i] = productId[i].productName
//           }
//           for(let i=0;i<quantityTotal.length;i++){
//               quantity[i] = quantityTotal[i]
//           }

//           const productDetails = orderData[i].productData.map(item=>item.name);

//           worksheet.addRow({
//               date:orderData[i].date.toLocaleDateString(),
//               productDetails:productName,
//               quantity:quantity,
//               name:customerName,
//               totalPrice: orderData[i].totalPrice,
//               paymentMode: orderData[i].payment,

//           });
//       }

//       res.setHeader(
//           "content-Type",
//           "application/vnd.openxmlformates-officedocument.spreadsheatml.sheet"
//       )

//       res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx')

//       return workbook.xlsx.write(res).then(() => {
//           res.status(200);
//       })



//       console.log("excel-generated")
//   } catch (error) {
//     next(error);
//   }
// }




module.exports = {
  loadHome,
  loadLogin,
  loadProductManagement,
  loadCategoryManagement,
  loadUserManagement,
  verifyLogin,
  logout,
  loadAddProduct,
  loadEditProduct,
  loadAddCategory,
  loadEditCategory,
  blockUser,
  unblockUser,
  addCategory,
  editCategory,
  disableCategory,
  enableCategory,
  addProduct,
  disableProduct,
  enableProduct,
  editProduct,
  deleteImage,
  loadOrderManagement,
  loadOrderDetails,
  loadCouponManagement,
  loadAddCoupon,
  addCoupon,
  orderShipped,
  orderOutForDelivery,
  orderDelivered,
  loadBannerManagement,
  loadAddBanner,
  addBanner,
  deleteBanner,
  loadEditBanner,
  deleteBannerImage,
  loadSalesReport,
  editBanner,
  salesSearch,
  graphDetails,
  // salesPdf
}