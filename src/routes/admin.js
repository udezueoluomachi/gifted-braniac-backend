const router = require('express').Router()
const controllers = require('../controllers/admin')
const {
    adminHasAuth: auth,
} = require('../middleware/validators')

router.post(
    "/access/register",
    controllers.registration
)

router.post(
    "/access/login",
    controllers.login
)

router.get(
    "/users/accounts",
    auth,
    controllers.getUsersAccounts
)

router.get(
    "/users/accounts/:userId/info",
    auth,
    controllers.getUserPersonalDetails
)

module.exports = router;