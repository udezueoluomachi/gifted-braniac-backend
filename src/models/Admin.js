const mongoose = require("mongoose");
const Error = require('../error/errors')

const Admin = mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    accessToken : {
        type : String
    },
},{
    timestamps : true
})

const admin = mongoose.model("Admin", Admin)

module.exports = admin