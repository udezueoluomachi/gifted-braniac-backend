const mongoose = require("mongoose");

const PaystackTransactionSchema = mongoose.Schema({
    owner : {
        type : mongoose.SchemaTypes.ObjectId,
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    reference : {
        type : String,
        required : true
    },
    fulfilled : {
        type : Boolean,
        default : false
    },
},{
    timestamps : true,
})



module.exports = mongoose.model("PaystackTransaction", PaystackTransactionSchema)