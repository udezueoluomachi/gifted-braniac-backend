const PaystackWebhookMessage = require("../models/PaystackWebhookMessage");

const recordMessage = async (req, res, next) => {
    try {
        await PaystackWebhookMessage.create({
            event : req.body.event,
            message : req.body
        })

        next()
    }
    catch(error) {
        next(error)
    }
}

module.exports = recordMessage;