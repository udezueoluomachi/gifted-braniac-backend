const onFinished = require("on-finished");
const RequestLogs = require("./../models/RequestLogs")
const http = require("http")


module.exports.logRequest = async (req, res, next) => {
    try {
        onFinished(res, async (err, res) => {
            if(err)
                console.log(err)
            await RequestLogs.create({
                userId : req?.user?._id ?? req?.admin?._id ?? "undefined",
                responseStatus : http.STATUS_CODES[res.statusCode] 
                                ?? res.statusCode ?? "undefined",
                endpoint : req.method + "  " + req.url,
                ip : req.headers['x-forwarded-for'] || req.ip 
                    || req.socket.remoteAddress || "undefined"
            })
        })

        next()
    }
    catch(error) {
        next(error)
    }
}