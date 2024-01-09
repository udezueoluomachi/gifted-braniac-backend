const mongoose = require("mongoose")

const UserTransactionHistorySchema = mongoose.Schema({
    owner : {
        type : mongoose.SchemaTypes.ObjectId,
        required : true,
        ref : "User"
    },
    amount : {
        type : Number,
        required : true
    },
    transactionType : {
        type : String,
        default : "payment"
    }
},
{
    timestamps : true
})

module.exports = mongoose.model("UserTransactionHistory", UserTransactionHistorySchema)