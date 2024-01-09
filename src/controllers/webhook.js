const paystack = require("paystack-api")(proces.env.PAYSTACK_SECRET);

const Payment = require("../models/Payment");
const Reservation = require("../models/Reservation");
const PaystackTransaction = require("../models/PaystackTransaction");
const UserTransactionHistory = require("../models/UserTransactionHistory.js")
const User = require("../models/User");
const {getPaymentChargeAndPercents} = require("../helpers/mathFunctions")
const {generateSpaceTitle} = require("../helpers/stringHandler")
const emailSender = require('../services/emailsender');

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
        if(!user || !user.isKycVerified)
            return false;

        transaction.fulfilled = true;
        await transaction.save();

        if(transaction.for === "fund") {
            const wallet = await Wallet.findOne({
                "owner" : transaction.owner
            })
            
            wallet.amount += transaction.amountToFund;
            await wallet.save();

            await UserTransactionHistory.create({
                owner : user._id,
                amount : transaction.amountToFund,
                note : "Walet funding",
                transactionType : "deposit"
            })
        }
        else {
            const reservation = await Reservation.findOne({ 
                "renter" : user._id,
                "_id" : transaction.for,
                "isPaidFor" : false
            })
            if(!reservation)
                return false

            const {
                totalAmount,
                amountOfChargePercent, 
                amountOfVATPercent,
                percentageFromHost
            } = await getPaymentChargeAndPercents(reservation.charge)
    
            reservation.isPaidFor = true;
            await reservation.save();
    
            const currentDate = new Date()
            const datePlus72hrs = currentDate + (1000 * 60 * 60 * 72)
            datePlus72hrs.setHours(0,0,0,0)
    
            await Payment.create({
                renter : user._id,
                host : reservation.host,
                amount : reservation.charge,
                reservation : reservation._id,
                space : reservation.space,
                ourAmountPercentOnRenter : amountOfChargePercent,
                vatAmountPercentOnRenter : amountOfVATPercent,
                ourPercentOnHost : percentageFromHost,
                dateToSendToHost : datePlus72hrs.toISOString()
            })
    
            await UserTransactionHistory.create({
                owner : user._id,
                amount : totalAmount,
                note : "For " + generateSpaceTitle(reservation.space),
                transactionType : "payment"
            })
        }
    }
    catch(error) {
        console.error(error)
    }
})

paystackEvents.on("transfer.success", data => {
    //mail the user
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
        if(!user || !user.isKycVerified)
            return false;

        transaction.fulfilled = true;
        await transaction.save();

        emailSender.withdrawalSuccessNotification(user.email, user.firstName, transaction.amountToFund)
    }
    catch(error) {
        console.error(error)
    }
})

paystackEvents.on("transfer.failed" , async data => {
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
        const wallet = await Wallet.findOne({
            "owner" : transaction.owner
        })
        if(!user || !user.isKycVerified)
            return false;

        wallet.amount += transaction.amountToFund;
        await wallet.save()
    
        await UserTransactionHistory.create({
            owner : user._id,
            amount : transaction.amountToFund,
            note : "reversal of failed withdrawal amount",
            transactionType : "reversal"
        })

        emailSender.withdrawalFailedNotification(user.email, user.firstName, transaction.amountToFund)
    }
    catch(error) {
        console.error(error)
    }
})

paystackEvents.on("transfer.reversed", async data => {
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
        const wallet = await Wallet.findOne({
            "owner" : transaction.owner
        })
        if(!user || !user.isKycVerified)
            return false;

        wallet.amount += transaction.amountToFund;
        await wallet.save()
    
        await UserTransactionHistory.create({
            owner : user._id,
            amount : transaction.amountToFund,
            note : "reversal of failed withdrawal amount",
            transactionType : "reversal"
        })

        emailSender.withdrawalFailedNotification(user.email, user.firstName, transaction.amountToFund)
    }
    catch(error) {
        console.error(error)
    }
})

module.exports.paystackEvents = paystackEvents