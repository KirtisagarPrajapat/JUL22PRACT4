var niv = require("./niv")
var constants = require("./../config/constants")
var multer = require("multer")
var path = require("path")
var rn = require("random-number")
var Cryptr = require("cryptr")
var cryptr = new Cryptr(process.env.secret)
var nodemailer = require("nodemailer")
var handlebars = require("handlebars")
var model = require("./../model")
var jwt = require("jsonwebtoken")
const userModel = require("../model/users")

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);



exports.encrypt = (data)=>{
    return cryptr.encrypt(JSON.stringify(data))
}

exports.decrypt = (data)=>{
    try{
        return JSON.parse(cryptr.decrypt(data))
    }catch(e){
        return false
    }
}

var mailTransport = nodemailer.createTransport({
    host : process.env.mailhost,
    service : process.env.mailservice,
    auth : {
        user : process.env.mailuser,
        pass : process.env.mailpass
    }
})

exports.resObj = (message = constants.msg.resSucc,data=[],is_error=false,status=200)=>{
    return { status, is_error, message, data }
}

exports.errObj = (msg=constants.msg.serverErr, status=500, data=[])=>{
    var err = new Error(msg)
    err.errStatus = status,
    err.errData = data
    return err
}

exports.validateIt = async(next,inp,rules,customMsg)=>{
    return new Promise(async(rslv,rjct)=>{

        var v = new niv.Validator(inp,rules,customMsg)
        var match = await v.check()
        if(!match){
            Object.values(v.errors).forEach((e,i)=>{
                if(i==0){
                    next(this.errObj(e.message,422))   
                    rslv(false)             
                }
            })
        }else{
            rslv(true)
        }
            
    })
}

exports.filesUpload = async(req,res,field,dest=constants.path.uploads)=>{
    return new Promise((rslv,rjct)=>{
        var store =  multer.diskStorage({
            destination : (req,file,cb)=>{
                cb(null,dest)               
            },
            filename : (req,file,cb)=>{
                cb(null,Date.now()+path.extname(file.originalname))
            }
        })
        multer({storage:store}).array(field)(req,res,(err)=>{
            if((!err) && req.files && req.files.length>0){
                rslv(true)
            }else{
                console.log(err)
                rslv(false)
            }
        })
    })
}

exports.rn = (min=1000,max=9999)=>{
    return rn({min,max,integer:true})
}

exports.sendMail = (to,obj={})=>{

    mailTransport.sendMail({
        to,
        subject : obj.subject?obj.subject:'',
        text : obj.text?obj.text:'',
        html : obj.html?obj.html:''
    },(err,res)=>{
        console.log(err)
        console.log(res)
    })
}

exports.sendSms = (userObj)=>{
    client.messages
    .create({body: 'Hello '+userObj.name+', otp for PRACT4 is'+userObj.status.otp, from: '+13256665256', to: '+91'+userObj.contact_no})
    .then(message => console.log(message.sid))
    .catch((e)=>{console.log(e)})  
}

exports.mailByUserObj = (userObj,type)=>{
    var mailVerifyHtml= handlebars.compile(constants.msg.mailVerifyHtml)({OTP:userObj.status.otp,NAME:userObj.name})
    var mailForgetHtml= handlebars.compile(constants.msg.mailForgetHtml)({OTP:userObj.status.otp,NAME:userObj.name})
    var obj = {
        subject : (type=='verify')?constants.msg.mailVerifySub:constants.msg.mailForgetSub,
        html :  (type=='verify')?mailVerifyHtml:mailForgetHtml
    }
    this.sendMail(userObj.email,obj)
}

exports.parseIt = (data)=>{
    var x
    try{
       x = JSON.parse(data)
    }catch(e){
        x = JSON.parse(JSON.stringify(data))
    }
    return x
}

exports.manipulateInp = (req,type,obj)=>{
    Object.keys(req[type]).forEach((e,i)=>{

        if(obj.trim){
            if(obj.trim.do && obj.trim.do.includes(e)){
                req[type][e] = req[type][e].trim()
            }else if(obj.trim.dont && (!obj.trim.dont.includes(e))){
                req[type][e] = req[type][e].trim()
            }else{
                req[type][e] = req[type][e].trim()
            }
        }

        if(obj.parse){
            if(obj.parse.do && obj.parse.do.includes(e)){
                req[type][e] = this.parseIt(req[type][e])
            }else if(obj.parse.dont && (!obj.parse.dont.includes(e))){
                req[type][e] = this.parseIt(req[type][e])
            }else{
                req[type][e] = this.parseIt(req[type][e])
            }
        }

    })
}


exports.checkEmailExists = async(email)=>{
    return new Promise(async(rslv,rjct)=>{
        var data = await model.getData('users',{email})
        rslv(data)
    })
}

exports.sendOtpByIdentity = (id,type)=>{
    return new Promise(async(rslv,rjct)=>{
        var user = await model.updateData('users',{_id:id},{'status.otp':this.rn()})
        this.mailByUserObj(user,type)
        rslv(user)
    })
}

exports.otpVerification = (id,otp)=>{
    return new Promise(async(rslv,rjct)=>{
        var data = await model.getData('users',{_id:id})
        if(!data) return rslv(false)
        rslv(data[0].status.otp==otp?data[0]:false)       
    })
}

exports.createTokenById = (id)=>{
    return new Promise(async(rslv,rjct)=>{
        jwt.sign({id},process.env.secret,{expiresIn:process.env.jwtExpire},(err,encode)=>{
            if(!encode) return rslv(false)
            rslv(encode)
        })
    })
}

exports.getTokenByuserObj = (userObj)=>{
    return new Promise(async(rslv,rjct)=>{
        var token = await userObj.createToken()
        await model.updateData('users',{_id:userObj._id},{'status.token':token,'status.email_verified':true,'status.otp':null})
        rslv(token)
    })
}

exports.verifyToken = (token)=>{
    return new Promise(async(rslv,rjct)=>{
        jwt.verify(token,process.env.secret,async(err,decode)=>{
            if(!decode) return rslv(false)
            var user = await model.getData("users",{_id:decode.id})
            if((!user)||(user[0].status.token!=token)) return rslv(false)
            rslv(user[0])
        })
    })
}

exports.userProfileKeys = (userObj)=>{
    return {name, gender, skills, country, state ,city, address, dob} = userObj
}

