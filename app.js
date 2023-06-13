const express = require("express");
const multer = require("multer");
const bodyparser = require("body-parser");
const encoder = bodyparser.urlencoded({extended:true});
const dotenv = require("dotenv");
const app=express();
const path = require("path");
const cookieParser = require("cookie-parser");
const ErrorHandler = require("./utils/ErrorHandler");
const catchAsyncErrors = require("./middleware/catchAsyncErrors");
const {isAuthenticatedUser,authorizeRoles} = require("./middleware/auth");
const {logout} = require("./controllers/userController");
const sendToken = require("./utils/jwtToken");
const fs = require("fs");
const uploadsDir = path.join("./public/uploads");
const uploadsDir2 = path.join(__dirname, "uploads_blogs");
const sharp = require("sharp");
const dateTime = require("simple-datetime-formater");   
const cloudinary = require('cloudinary').v2;


app.use(express.json());
app.use(cookieParser());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'));
const user = require('./routes/userRoute');
const Post = require("./models/postModel");
const User = require("./models/userModel");
app.set('view engine', 'ejs')
//Config       
if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({path:"config/config.env"});
} 

//database connection
const connect = require("./database");

function generateThumbnail(filepath) {
    const thumbnailFilename = path.join(
      path.dirname(filepath),
      "thumbnails",
      path.basename(filepath)
    );
    return sharp(filepath)
      .resize(200, 200)
      .toFile(thumbnailFilename)
      .then(() => thumbnailFilename);
  }



app.use('/api/v1',user);
const mongoose = require('mongoose');

// configure multer middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const folder = req.params.folder;
      const subfolder = req.params.subfolder;
      cb(null, `./public/uploads/${folder}/${subfolder}`);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads_blogs/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });

  const upload2 = multer({
    storage: storage2, // limit file size to 1 MB
     
  });
  const upload = multer({
    storage: storage, // limit file size to 1 MB
   
  });

  const getAllPosts = async (req, res, next) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 });
      res.locals.posts = posts;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching posts');
    }
  };

  // app.get("/notes/:folder/:subfolder", isAuthenticatedUser, (req, res) => {
  //   const folder = req.params.folder;
  //   const subfolder = req.params.subfolder;
  
  //   const folderPath = `semesters_notes/${folder}/${subfolder}`;
  //   const uploadsFolderPath = path.join(uploadsDir, folder, subfolder);
  
  //   fs.readdir(uploadsFolderPath, function (err, files) {
  //     if (err) {
  //       console.error("Error reading uploads directory:", err);
  //       files = []; // Set files to an empty array if an error occurred
  //     }
  
  //     res.render(folderPath, {
  //       files: files.map(function (filename) {
  //         return {
  //           filename: filename,
  //           originalname: filename.replace(/.[^.]*$/, ""),
  //         };
  //       }),
  //     });
  //   });
  // });
  
  app.get(`/notes/:folder/:subfolder`, function(req, res) {
    const folder = req.params.folder;
    const subfolder = req.params.subfolder;
    var query = req.query.q; // Get the search query from the URL parameters
    const folderPath = `semesters_notes/${folder}/${subfolder}`;
    const uploadsFolderPath = path.join(uploadsDir, folder, subfolder);
    var files = getUploadedFiles(uploadsFolderPath, query); // Filter the uploaded files by the search query
    res.render(folderPath, { files: files });
  });
  
  function getUploadedFiles(uploadsDir, query) {
    var files = fs.readdirSync(uploadsDir); // Read the directory synchronously
    if (query) { // If there is a search query, filter the files by the query
      files = files.filter(function(file) {
        return file.toLowerCase().indexOf(query.toLowerCase()) !== -1; // Case-insensitive search
      });
    }
    return files.map(function(file) {
      return { filename: file, originalname: file };
    });
  }


  app.post("/upload/:folder/:subfolder", function (req, res) {
    upload.single("fileToUpload")(req, res, function (err) {
      const folder = req.params.folder;
      const subfolder = req.params.subfolder;
        if (err instanceof multer.MulterError) {
            res.status(500).send("An error occurred while uploading the file.");
          } else if (err) {
            res.status(500).send("An unknown error occurred while uploading the file.");
          } else {
            res.redirect(`/notes/${folder}/${subfolder}`);
          }
    });
  });
  
// serve uploaded files
app.use("/uploads", express.static(path.join("./public/uploads")));
app.use("/uploads_blogs", express.static(path.join(__dirname, "uploads_blogs")));

// handle GET requests to /download/:filename
app.get(`/download/:folder/:subfolder/:filename`, function (req, res) {
  const folder = req.params.folder;
  const subfolder = req.params.subfolder;
  const filename = req.params.filename;
    console.log(req.params.filename);
  const filePath = path.join(`./public/uploads/${folder}/${subfolder}/${filename}` );
  res.download(filePath, function (err) {
    if (err) {
      res.status(404).send("File not found.");
    }
  });
});



// app.get("/carpooling",async (req, res,next) => {
//     res.render("carpooling");
// })


app.get("/",getAllPosts,async (req, res,next) => {
  const token = req.cookies.token;
  if(token){
    res.redirect('/home');
  }
  else{
    res.render("index");
  }
    
})

app.post("/",getAllPosts,async (req,res,next) => {
    const enrollment_id = req.body.enrollment_id;
    const password = req.body.password;
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
    sendToken(user,201,res);
    res.render("home",{enrollment_id:enrollment_id,password:password});


})

app.get('/home',getAllPosts,isAuthenticatedUser ,(req,res) => {
    res.render('home');
})
app.get("/gaming",isAuthenticatedUser,function(req,res){
  res.render("chat");
})
app.get("/profile",isAuthenticatedUser,function(req,res){
  const user = req.user;
  res.render("profile",{user});
})
app.get("/notes",isAuthenticatedUser,(req,res)=>{
  res.render("sem_notes");
})
app.get("/notes/sem1",isAuthenticatedUser,(req,res)=>{
  res.render("semesters_notes/sem1");
})
app.get("/notes/sem2",isAuthenticatedUser,(req,res)=>{
  res.render("semesters_notes/sem2");
})
app.get('/blogs',getAllPosts, (req, res) => {
  res.render('blog');
});
app.get("/logout",logout);


app.post('/add', upload2.single('image'),async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const namee = req.body.namee;

  // if (req.file) {
  //   post.image = `/uploads_blogs/${req.file.filename}`;
  // }
  const myCloud = await cloudinary.uploader.upload(req.file.path, {
    folder:"postsPics",
    width:150,
    crop:"scale",
})
    const post = new Post({ 
      title : title, 
      body : body,
      image : {
        public_id:myCloud.public_id,
        url:myCloud.secure_url,
      },
      namee:namee,
    });
   await post.save()
    .then(() => {
      res.redirect('/blogs');
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

module.exports = app








