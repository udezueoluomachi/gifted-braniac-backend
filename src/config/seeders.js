require('dotenv').config()


const MONGO_URI = process.env.MONGO_URI


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const JWT_EXPIREIN_DATE = process.env.JWT_EXPIREIN_DATE

module.exports = {  MONGO_URI, ACCESS_TOKEN_SECRET, JWT_EXPIREIN_DATE}