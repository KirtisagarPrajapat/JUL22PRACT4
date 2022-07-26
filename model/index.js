
var mongoose = require("mongoose")

exports.getData = (collection, condition={})=>{
    return new Promise((rslv,rjct)=>{
        mongoose.model(collection).find(condition,(err,res)=>{
            if(res && res.length>0){
                rslv(res)
            }else{
                rslv(false)
            }
        })            
    })
}

exports.updateData = (collection,where={},what={},createNew=false)=>{
    return new Promise((rslv,rjct)=>{
        mongoose.model(collection).findOneAndUpdate(where,what,{new:true,upsert:createNew},(err,res)=>{
            if(res){
                rslv(res)
            }else{
                rslv(false)
            }
        })
    })
}

