const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next)=>{
    const { token } = req.cookies;
   
    if(!token){
        return next(new ErrorHandler("Please Login to access this Resource",401));
    }
   
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

   req.user = await User.findById(decodedData.id);
   
   next();
})

exports.authorizeRoles = (...roles)=>{
    
    return (req,res,next)=>{
        //if 'role' property(it's value would be 'user') not included in our user array
        if(!roles.includes(req.user.role)){
        return next(
            new ErrorHandler(
                `Role: ${req.user.role} is not allowed to access this resource`,
                403
                )
        )
        }
        next();
    };
};

