const router = require("express").Router();
const controller = require("../controllers/payment")
const { hasAuth: auth} = require("../middleware/validators");


router.use(auth);


//get payment info
router.get("/third-party/fee/:amount", controller.getPaystackFeeForAmount)
//making payments

module.exports = router;