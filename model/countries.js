
var mongoose = require("mongoose")
var countrySchema = new mongoose.Schema({
    id : {
        type : String
    },
    name : {
        type : String
    },
})

exports.countryModel = mongoose.model("countries",countrySchema)