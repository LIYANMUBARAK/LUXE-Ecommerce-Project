function errorHandler(err,req,res,next){
    console.log(err.stack)
    res.status(500)
    res.render('error')
}

module.exports={errorHandler}