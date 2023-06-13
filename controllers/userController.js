const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
exports.loginUser = catchAsyncErrors (async (req,res,next)=>{

    var enrollment_id = req.body.enrollment_id;
    var password = req.body.password;
    console.log(enrollment_id);
    if(!enrollment_id || !password){
        return next(new ErrorHandler("Please Enter Email and Password",400))
    }

    const user =await User.findOne({enrollment_id}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password",401));

    }

    const isPasswordMatched =await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password",401));

    }
    const token = user.getJWTToken();
    res.redirect("/home");
    res.status(201).json({
        token,
    })
})

exports.registerUser = catchAsyncErrors( async(req,res,next)=>{

   
    const {enrollment_id,password,role,namee} = req.body;

    const user = await User.create({
        
        enrollment_id,
        password,
        namee,
        role,
    });

    sendToken(user,201,res);
    res.status(201).json({
        success:true,
        message:"Successfully registered given user",
    })
})

exports.logout = catchAsyncErrors( async (req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });
    res.redirect("/");
});
