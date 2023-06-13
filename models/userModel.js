const mongoose = require('mongoose');

 const validator = require('validator');

 const bcrypt = require('bcryptjs');

 const jwt = require('jsonwebtoken');

 const crypto = require('crypto');

const userSchema = new mongoose.Schema({

   
    enrollment_id:{
        type:String,
        required:[true,"Please Enter Your Email Address"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Please Enter password"],
        minLength:[8,"Password should be greater than 8 passwords"],
        select: false, 
    },
    namee:{
        type:String,
        required:[true,"Please Enter Name"],
    },
    role:{
        type:String,
        default:"user",
    },
   
});

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password =await bcrypt.hash(this.password,10);

});

userSchema.methods.getJWTToken = function () { 
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });

};

userSchema.methods.comparePassword = async function(enteredPassword){
   // return await enteredPassword === this.password;
     return await bcrypt.compare(enteredPassword,(this.password));
}

module.exports = mongoose.model("User",userSchema);