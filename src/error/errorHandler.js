const Error = require("./errors");

module.exports = (err, req, res, next) => {
    err = err.instance ? err.instance : err

    if (err instanceof Error)
        return res.status(err.status).send(err)

    console.log(err)
    return res.status(500).send({
        message: "something went wrong",
        status: 500,
        sucess: false
    })
}