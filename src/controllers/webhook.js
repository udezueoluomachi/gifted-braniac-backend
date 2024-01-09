const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET);

const PaystackTransaction = require("../models/PaystackTransaction");
const UserTransactionHistory = require("../models/UserTransactionHistory")
const User = require("../models/User");

const paystackEvents = paystack.Events;

paystackEvents.on("charge.success", async data => {
    try {
        const transaction = await PaystackTransaction.findOne({
            reference : data.reference,
            fulfilled : false
        })
        if(!transaction)
            return false;

        const user = await User.findOne({
            "_id" : transaction.owner
        })
        if(!user)
            return false;

        transaction.fulfilled = true;
        await transaction.save();

        await UserTransactionHistory.create({
            owner : user._id,
            amount : transaction.amount,
        })
    }
    catch(error) {
        console.error(error)
    }
})

module.exports.paystackEvents = paystackEvents