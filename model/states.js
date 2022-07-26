
var mongoose = require("mongoose")
var stateSchema = new mongoose.Schema({
    id : {
        type : String
    },
    country_id : {
        type : String
    },
    name : {
        type : String
    },
})

exports.stateModel = mongoose.model("states",stateSchema)