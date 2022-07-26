require("dotenv").config()
var express = require("express")
var app = express()
var http = require("http").Server(app)
var passport = require("passport")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize())

require("./config/config")
app.use("/api",require("./router"))
require("./middlewares/auth")

require("./helper/errHandler")(app)

http.listen(process.env.serverPort,()=>{
    console.log(`server running on ${process.env.serverPort}`)
})