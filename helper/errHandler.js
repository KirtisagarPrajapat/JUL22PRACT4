const constants = require("../config/constants")
const helper = require("./common")

module.exports = (app)=>{
    app.use((err,req,res,next)=>{
        var msg = err.message?err.message:constants.msg.serverErr
        var status = err.errStatus?err.errStatus:500
        var data = err.errData?err.errData:[]

        res.json(helper.resObj(msg,data,true,status))
    })   
}