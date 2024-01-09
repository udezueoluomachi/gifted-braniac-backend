const router = require("express").Router();
const {validatePaystackWebhook} = require("../middleware/validators");
const recordPaystackMessage = require("../middleware/paystackWebhookRecorder")
const controller = require("../controller/webhook")

router.post("/paystack", validatePaystackWebhook, recordPaystackMessage, controller.paystackEvents.middleware)

module.exports = router;