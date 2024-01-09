const mongoose = require("mongoose");

const RequestLogs = mongoose.Schema({
    userId : {
        type : String,
        required : true,
    },
    responseStatus : {
        type : String,
        required : true
    },
    endpoint : {
        type : String,
        required : true
    },
    ip : {
        type : String,
        required : true
    }
}, {timestamps : true})

module.exports = mongoose.model("RequestLogs", RequestLogs)