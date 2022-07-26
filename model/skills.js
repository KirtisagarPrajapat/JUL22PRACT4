
var mongoose = require("mongoose")
var skillSchema = new mongoose.Schema({
    id : {
        type : String
    },
    name : {
        type : String
    },
})

exports.skillModel = mongoose.model("skills",skillSchema)


// this.skillModel.insertMany([
//     {
//         id : 1 , name : "Nodejs"
//     },
//     {
//         id : 2 , name : "Angular",
//     },
//     {
//         id : 3 , name : "Mysql",
//     },
//     {
//         id : 4 , name : "Mongodb"
//     },
// ],(err,res)=>{
//     console.log(res)
// })

