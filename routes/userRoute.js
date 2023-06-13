const express = require('express');
const {loginUser,registerUser} = require("../controllers/userController");
const router = express.Router();
const {authorizeRoles, isAuthenticatedUser} = require("../middleware/auth");

router.route("/").post(loginUser)
router.route("/register").post(isAuthenticatedUser,authorizeRoles("admin"),registerUser);



module.exports = router;