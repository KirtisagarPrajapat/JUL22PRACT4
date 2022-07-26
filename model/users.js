
var mongoose = require("mongoose")
var helper = require("./../helper/common")

var userSchema = new mongoose.Schema({
    name : {
        type : String
    },
    email : {
        type : String
    },
    password : {
        type : String
    },
    gender : {
        type : String
    },
    country : {
        type : String
    },
    state : {
        type : String
    },
    city : {
        type : String
    },
    photo : {
        type : String
    },
    dob : {
        type : String
    },
    skills : {
        type : Array
    },
    address : {
        type : Array
    },
    contact_no : {
        type : String
    },
    status : {
        profile_commplete : {
            type : Boolean
        },
        email_verified : {
            type : Boolean
        },
        otp : {
            type : Number
        },
        token : {
            type : String
        }
    },
})

userSchema.methods.createToken = async function(){
    var user = this
    return new Promise(async(rslv,rjct)=>{
        var token = await helper.createTokenById(user._id)
        if(!token) return rslv(false)
        rslv(token)
    })
}

exports.userModel = mongoose.model("users",userSchema)

exports.saveUser = (userObj,otp)=>{
    return new Promise((rslv,rjct)=>{

        var user = new this.userModel(userObj)
        user.password = helper.encrypt(user.password)
        user.status.profile_commplete = true
        user.status.otp = otp
        user.save((err,res)=>{
            if(res){
                rslv(res)                
            }else{
                rslv(false)
            }       
        })
            
    })
}


exports.dashData = (id)=>{
    return new Promise((rslv,rjct)=>{
        this.userModel.aggregate([
            {
                $match : {
                    _id : mongoose.Types.ObjectId(id)
                }
            },
            {
                $project : {
                    __v:0, _id:0, email:0, password:0, contact_no:0, status:0
                }
            },
            {
                $lookup : {
                    from : "users",
                    as : "users",
                    let : {myid : '$_id'},
                    pipeline : [
                        {
                            $match : {
                                _id : {
                                    $ne : id
                                }
                            }
                        },
                        {
                            $project : {
                                __v:0, email:0, password:0, contact_no:0, status:0
                            }
                        },

                    ]
                }
            }
        ],(err,res)=>{
            if(res){
                rslv(res)
            }else{
                console.log(err)
                rslv(false)
            }
        })       
    })
}

exports.dashboardData = (id)=>{
    return new Promise((rslv,rjct)=>{
        this.userModel.aggregate([
            {
                $match : {
                    _id : mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from : "users",
                    as : "users",
                    let : {id : '$_id'},
                    pipeline : [
                        {
                            $match : {
                                $expr : {
                                    $ne : ['$_id','$$id']
                                }
                            }
                        },
                        {
                            $lookup : {
                                from : "skills",
                                as : "my_skills",
                                pipeline : []
                            }
                        },
                        {
                            $addFields : {
                                my_skills : {
                                    $map : {
                                        input : '$my_skills',
                                        in : {
                                            $mergeObjects : [
                                                '$$this',
                                                {
                                                    selected : {
                                                        $cond : {
                                                            if : {
                                                                $eq : [
                                                                    {
                                                                        $indexOfArray : [
                                                                            '$skills', {$toInt:'$$this.id'}
                                                                        ]
                                                                    }, -1
                                                                ]
                                                            },
                                                            then : false,
                                                            else : true
                                                        }
                                                    }
                                                }
                                            ]               
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ],(err,res)=>{
            if(res){
                rslv(res)
            }else{
                console.log(err)
                rslv(false)
            }
        })       
    })
}