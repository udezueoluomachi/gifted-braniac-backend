const mongoose = require("mongoose");

const PaystackWebhookMessageSchema = mongoose.Schema({
    event : {
        type : String,
        required : true
    },
    message : {
        type : mongoose.SchemaTypes.Mixed,
        required : true
    }
},{
    timestamps : true,
})



module.exports = mongoose.model("PaystackWebhookMessage", PaystackWebhookMessageSchema)