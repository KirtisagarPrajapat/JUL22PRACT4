
var mongoose = require("mongoose")
var citySchema = new mongoose.Schema({
    id : {
        type : String
    },
    state_id : {
        type : String
    },
    name : {
        type : String
    },
})

exports.cityModel = mongoose.model("cities",citySchema)