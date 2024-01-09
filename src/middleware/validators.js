const User = require('../models/User');
const Error = require('../error/errors')
const { validateAccessToken, verifyJwtToken} = require('../utils/token')

module.exports.hasAuth = async function (req, res, next) {
    try {
        if (!req.headers.authorization)
            return next(Error.badRequest("No Authorization Header"))

        const token = req.headers.authorization.split(" ")[1]

        if (!req.headers.authorization.startsWith("Bearer"))
            return next(Error.badRequest("Invalid Authorization Header"))

        const user = await validateAccessToken(token)

        if (user instanceof Error)
            return next(user)

        req.user = user
        req.accessToken = token
        return next()


    } catch (err) {
        next({ err })
    }
}

module.exports.validatePaystackWebhook = async (req, res, next) => {
    try {
        const reqIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
        const whitlistedIps = ["52.31.139.75", "52.49.173.169", "52.214.14.220"]
        //TODO add more security feature.
        if(!(whitlistedIps.some(ip => ip === reqIp))) {
            return next(Error.badRequest("Invalid Request"));
        }
        else {
            next();
        }
    }
    catch(error) {
        next(error)
    }
}