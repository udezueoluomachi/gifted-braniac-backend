const Schema = require("json-validace");
const {OK, CREATED, NOT_FOUND} = require("http-status-codes")
const Error = require("../error/errors");
const PaystackTransaction = require("../models/PaystackTransaction");
const UserTransactionHistory = require("../models/UserTransactionHistory.js")
const Paystack = require("paystack-api")(process.env.PAYSTACK_SECRET)


module.exports.getAllTransactionHistory = async (req, res, next) => {
    try {
        const {user} = req;

        const transactionHistory = await UserTransactionHistory.find({
            "owner" : user._id
        })
        if(!transactionHistory || transactionHistory?.length === 0)
            return res.status(NOT_FOUND).send({
                success : true,
                message : "You have no transaction history"
            })

        transactionHistory.sort(
            (a, b) => (new Date(b.createdAt)) - (new Date(a.createdAt))
        )

        res.status(OK).send({
            success : true,
            message : "Transaction history fetched successfully",
            data : transactionHistory
        })
    }
    catch(error) {
        next(error)
    }
}


module.exports.getPaystackFeeForAmount = (req, res, next) => {
    try {
        const amount = process.env.LESSON_FEE;

        const feeHelper = new Paystack.FeeHelper()
        const total = feeHelper.addFeesTo(amount * 100)

        const fee = (total - (amount * 100))  / 100

        res.status(OK).send({
            success : true,
            message : "Fee gotten successfully",
            data : {fee}
        })
    }
    catch(error) {
        next(error)
    }
}



module.exports.createPaymentRequest = async (req, res, next) => {
    try {
        const {user} = req;

        const amount = process.env.LESSON_FEE

        const feeHelper = new Paystack.FeeHelper()
        const total = feeHelper.addFeesTo(amount * 100)

        const transaction = await Paystack.transaction.initialize({
            email : user.email,
            amount : `${total}`,
            currency : "NGN"
        })
        if(transaction.status !== true || !transaction.status)
            return next(Error.internalServerError("Something went wrong"))

        await PaystackTransaction.create({
            owner : user._id,
            amount : amount,
            reference : transaction.data.reference,
        })

        res.status(CREATED).send({
            success : true,
            message : "Payment link generated",
            data : transaction.data
        })
    }
    catch(error) {
        next(error)
    }
}