
var helper = require('./../helper/common')
var constants = require("./../config/constants")
var model = require("./../model")
var niv = require("./../helper/niv")
var userModel = require("./../model/users")
const passport = require('passport')
const fs = require("fs")

exports.defaultRoute = (req,res,next)=>{
    next(helper.errObj(constants.msg.invalidRoute,404))
}

exports.getCountries = async(req,res,next)=>{
    var countries = await model.getData('countries')
    if(!countries) return next(helper.errObj(constants.msg.noData,404))
    else{
        res.json(helper.resObj(constants.msg.gotData,countries))
    }
}

exports.getStates = async(req,res,next)=>{
    var valid = await helper.validateIt(next,req.query,{
        country_id : "required|integer"
    })
    if(!valid) return false
     var states = await model.getData('states',{country_id:req.query.country_id})
     if(!states) return next(helper.errObj(constants.msg.noData,404))
     else{
         res.json(helper.resObj(constants.msg.gotData,states))
     }
}

exports.getCities = async(req,res,next)=>{
    var valid = await helper.validateIt(next,req.query,{
        state_id : "required|integer"
    })
    if(!valid) return false
     var cities = await model.getData('cities',{state_id:req.query.state_id})
     if(!cities) return next(helper.errObj(constants.msg.noData,404))
     else{
         res.json(helper.resObj(constants.msg.gotData,cities))
     }
}

exports.getSkills = async(req,res,next)=>{
    var skills = await model.getData('skills')
    if(!skills) return next(helper.errObj(constants.msg.noData,404))
    else{
        res.json(helper.resObj(constants.msg.gotData,skills))
    }
}

exports.registerUser = async(req,res,next)=>{
    var files = await helper.filesUpload(req,res,'photo')

    helper.manipulateInp(req,'body',{trim:{},parse:{}})

    var valid = await helper.validateIt(next,req.body,{
        name : "required",
        email : "required|uniqueEmail",
        password : "required",
        gender : "required",
        skills : "required|array",
        'skills.*' : "required|integer",
        country : "required|integer",
        state : "required|integer",
        city : "required|integer",
        address : "required|array",
        'address.*' : "required|object",
        'address.*.home_no' : "required",
        'address.*.colony' : "required",
        dob : "required|date|dateBeforeToday:18,years",
        contact_no : "required|integer|uniquePhone",
    })
    if(!valid) return false
    if(files){
        req.body.photo = req.files[0].filename
    }
    var user = await userModel.saveUser(req.body,helper.rn())

    helper.mailByUserObj(user,'verify')   

    helper.sendSms(user)

    res.json(helper.resObj(constants.msg.registerSuccess,{identity : helper.encrypt(user._id)}))
}


exports.resendOtp = async(req,res,next)=>{

    var valid = await helper.validateIt(next,req.body,{
        identity:"required|isEncrypted",
        type:"required",
    })
    if(!valid) return false
    var user = await helper.sendOtpByIdentity(helper.decrypt(req.body.identity),req.body.type)
    helper.sendSms(user)
    res.json(helper.resObj(constants.msg.otpSent))
}


exports.verifyAccountOtp = async(req,res,next)=>{

    var valid = await helper.validateIt(next,req.body,{
        identity:"required|isEncrypted",
        otp:"required|integer",
    })
    if(!valid) return false
    var user = await helper.otpVerification(helper.decrypt(req.body.identity),req.body.otp)
    if(!user) return false
    var token = await helper.getTokenByuserObj(user)
    res.json(helper.resObj(constants.msg.verifiedSucc,{token}))
}

exports.login = async(req,res,next)=>{

    var valid = await helper.validateIt(next,req.body,{
        email:"required",
        password:"required",
    })
    if(!valid) return false

    passport.authenticate("local",async(err,user,error)=>{
        if(err){
            next(helper.errObj())
        }else if(user){
            var token = await helper.getTokenByuserObj(user)
            res.json(helper.resObj(constants.msg.loginSucc,{token}))
        }else{
            if(error.status==401){
                next(helper.errObj(error.message,error.status))
            }else if(error.status==403){
                next(helper.errObj(error.message,error.status,{identity:helper.encrypt(error.data)}))
            }else{
                next(helper.errObj())
            }
        }
    })(req,res,next)
}


exports.forgetPassword = async(req,res,next)=>{

    var valid = await helper.validateIt(next,req.body,{
        email:"required|email",
    })
    if(!valid) return false

    var user = await helper.checkEmailExists(req.body.email)
    if(!user) return next(helper.errObj(constants.msg.noData,404))
    user = user[0]
    await helper.sendOtpByIdentity(user._id,'forgot')
    res.json(helper.resObj(constants.msg.otpForgotSent,{identity:helper.encrypt(user._id)}))

}



exports.verifyForgetPasswordOtp = async(req,res,next)=>{

    var valid = await helper.validateIt(next,req.body,{
        identity:"required|isEncrypted",
        otp:"required|integer",
    })
    if(!valid) return false
    var user = await helper.otpVerification(helper.decrypt(req.body.identity),req.body.otp)
    if(!user) return next(helper.errObj())
    res.json(helper.resObj(constants.msg.verifiedForgotPassOtpSucc,{identity:helper.encrypt({id:user._id,verified:true})}))
}


exports.resetPassword = async(req,res,next)=>{

    var valid = await helper.validateIt(next,req.body,{
        identity:"required|isEncrypted",
        password:"required",
    })
    if(!valid) return false
    var decrypt = helper.decrypt(req.body.identity)
    var user = await helper.otpVerification(decrypt.id,req.body.otp)
    if(!user) return next(helper.errObj())
    if(decrypt.verified!=true) return next(helper.errObj())
    model.updateData("users",{_id:decrypt.id},{password:helper.encrypt(req.body.password)})
    res.json(helper.resObj(constants.msg.passwordResetSuccess))
}


exports.dashData = async(req,res,next)=>{

    var data = await userModel.dashData(req.userObj._id)
    res.send(data)
}


exports.updateUser = async(req,res,next)=>{
    var files = await helper.filesUpload(req,res,'photo')

    helper.manipulateInp(req,'body',{trim:{},parse:{}})

    var valid = await helper.validateIt(next,req.body,{
        name : "required",
        gender : "required",
        skills : "required|array",
        'skills.*' : "required|integer",
        country : "required|integer",
        state : "required|integer",
        city : "required|integer",
        address : "required|array",
        'address.*' : "required|object",
        'address.*.home_no' : "required",
        'address.*.colony' : "required",
        dob : "required|date|dateBeforeToday:18,years",
    })
    if(!valid) return false
    if(files){
        req.body.photo = req.files[0].filename
        if(req.userObj.photo && (req.userObj.photo!='')){
            fs.unlinkSync(constants.path.uploads+req.userObj.photo)
        }
    }
    await model.updateData('users',{_id:req.userObj._id},req.body)

    res.json(helper.resObj(constants.msg.profileUpdated))
}
