require("dotenv").config();
const express = require("express");
const fingerprint = require("express-fingerprint");
const cors = require("cors");
const logger = require("morgan");
const { NOT_FOUND } = require('http-status-codes');

require("./config/mongoose.config").database();
 
//my imports
const errorHandler = require("./error/errorHandler");

//routers
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const webhookRoutes = require("./routes/webhook");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(fingerprint({}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("tiny"))

app.use(function (req, res, next) {
    req.baseUrl = `${req.protocol}://${req.headers['host']}`
    next()
})

//routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/webhook", webhookRoutes)
app.use("/api/v1/admin", adminRoutes)

app.use(errorHandler)

// 404 handler
app.use(function (req, res, next) {
    return res.status(NOT_FOUND).json({
        message: "Resources not found!",
        status: 404,
        sucess: false
    });
});

module.exports = app;