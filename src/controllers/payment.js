const Schema = require("json-validace");
const {OK, CREATED, NOT_FOUND} = require("http-status-codes")
const Error = require("../error/errors");
const Payment = require("../models/Payment");
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
        const validationSchema = new Schema({
            amount : {type : "number", required : true}
        })
        const result = validationSchema.validate(req.params);
        if(result.error)
            return next(Error.badRequest("Invalid request parameters", result.error))
        const {amount} = result.data;

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



module.exports.createReservationPaymentRequestForCard = async (req, res, next) => {
    try {
        const validationSchema = new Schema({
            reservationId : {type : "mongoid", required : true}
        })
        const result = validationSchema.validate(req.params)
        if(result.error)
            return next(Error.badRequest("Invalid request parameters", result.error))
        const {reservationId} = result.data;
        const {user} = req;

        const reservation = await Reservation.findOne({ 
            "renter" : user._id,
            "_id" : reservationId
        })
        if(!reservation)
            return res.status(NOT_FOUND).send({
                success : false,
                message : "Reservation not found"
            })

        if(reservation.isPaidFor)
            return next(Error.badRequest("Reservation already paid for"))

        const {
            totalAmount
        } = await getPaymentChargeAndPercents(reservation.charge)

        const feeHelper = new Paystack.FeeHelper()
        const total = feeHelper.addFeesTo(totalAmount * 100)

        const transaction = await Paystack.transaction.initialize({
            email : user.email,
            amount : `${total}`,
            channels : ["card"],
            currency : "NGN"
        })
        if(transaction.status !== true || !transaction.status)
            return next(Error.internalServerError("Something went wrong"))

        await PaystackTransaction.create({
            owner : user._id,
            amountToFund : amount,
            reference : transaction.data.reference,
            for : reservationId
        })

        res.status(CREATED).send({
            success : true,
            message : "Reservation payment link generated",
            data : transaction.data
        })
    }
    catch(error) {
        next(error)
    }
}