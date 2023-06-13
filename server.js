const app = require("./app.js");
const connectDatabase = require('./database');
const cloudinary = require('cloudinary').v2;
//Handling Uncaught Exception          //console.log(youtube)  //youtube is not defined right,so causing an error
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log('Shutting down the server due to uncaught exception');

    server.close(()=>{
        process.exit(1);
    })
})

//Config       
// if(process.env.NODE_ENV!== "PRODUCTION"){
//     require("dotenv").config({path:"backend/config/config.env"});
// }

//Connect to Database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})
const server = app.listen(process.env.PORT,()=>{
    console.log("Server is running on port");
}) 

//Unhandled Process Rejection     // like mistake in typo in config.env
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled Error Rejection');

    server.close(()=>{
        process.exit(1);
    })
})