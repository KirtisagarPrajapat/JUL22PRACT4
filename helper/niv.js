var niv = require("node-input-validator")
const constants = require("../config/constants");
const helper = require("./common")
const model = require("./../model")

niv.extend('uniqueEmail',async({value,args},validator)=>{
    var exists = await helper.checkEmailExists(value)
    console.log(exists)
    if(exists){
        return false
    }else{
        return true
    }
})

niv.extend('uniquePhone',async({value,args},validator)=>{
    var exists = await model.getData('users',{contact_no:value})
    if(exists){
        return false
    }else{
        return true
    }
})

niv.extend('isEncrypted',async({value,args},validator)=>{
     return helper.decrypt(value)?true:false
})

niv.extendMessages({
    uniqueEmail : "Email already exists.",
    uniquePhone : "Contact No. already exists.",
    isEncrypted : ":attribute must be in proper encrypted form.",
})

module.exports = niv
