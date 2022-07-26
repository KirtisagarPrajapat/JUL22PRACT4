
var passport = require("passport")
const constants = require("../config/constants")
var localStrategy = require("passport-local").Strategy
var model = require("../model")
var helper = require("./../helper/common")

passport.use(new localStrategy({usernameField:"email",passwordField:"password"},async(username,password,done)=>{
    var user =  await model.getData("users",{email:username})
    if(!user) return done(null,false,{message:constants.msg.wrongCredentials,status:401})
    var test = helper.decrypt(user[0].password)
    if(!(helper.decrypt(user[0].password)==password)) return done(null,false,{message:constants.msg.wrongCredentials,status:401})
    if(!user[0].status.email_verified) return done(null,false,{message:constants.msg.unvarified,status:403,data:user[0]._id})
    done(null,user[0])
}))

exports.authorizeToken = async(req,res,next)=>{
    if('authorization' in req.headers){
        var user = await helper.verifyToken(req.headers.authorization)
        if(!user) return next(helper.errObj(constants.msg.tokenAuthFailed,403))
        req.userObj = user
        next()
    }else{
        next(helper.errObj(constants.msg.tokenAuthFailed,403))
    }
}