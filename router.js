
var express = require("express")
var Router = express.Router()
var userControl = require("./controller/user")
var userAuth = require("./middlewares/auth")
var auth = [userAuth.authorizeToken]

Router.get("/", userControl.defaultRoute)
Router.get("/getCountries", userControl.getCountries)
Router.get("/getStates", userControl.getStates)
Router.get("/getCities", userControl.getCities)
Router.get("/getSkills", userControl.getSkills)
Router.post("/registerUser", userControl.registerUser)
Router.post("/resendOtp", userControl.resendOtp)
Router.post("/verifyAccountOtp", userControl.verifyAccountOtp)
Router.post("/login", userControl.login)
Router.post("/forgetPassword", userControl.forgetPassword)
Router.post("/verifyForgetPasswordOtp", userControl.verifyForgetPasswordOtp)
Router.post("/resetPassword", userControl.resetPassword)
Router.get("/dashData", auth, userControl.dashData)
Router.post("/updateUser", auth, userControl.updateUser)


module.exports = Router 