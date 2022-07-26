
var mongoose = require("mongoose")
var fs = require("fs")
const constants = require("./constants")

mongoose.connect(process.env.mongoUrl,(err)=>{
    if(err) return console.log("db connection error...")
    else{
        fs.readdirSync(constants.path.model).forEach((e,i)=>{
            require(constants.path.model+e)
        })
        console.log("db connected successfully")
    } 
})