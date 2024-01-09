const router = require("express").Router();
const controller = require("../controllers/payment")
const { hasAuth: auth} = require("../middleware/validators");


router.use(auth);

router.get("/history", controller.getAllTransactionHistory)

//get payment info
router.get("/third-party/fee", controller.getPaystackFeeForAmount)
//making payments
router.post("create", controller.createPaymentRequest)

module.exports = router;