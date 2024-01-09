const mongoose = require('mongoose');

const url = process.env.MONGODB_URL
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}

const database = async () => {
    try {
        mongoose.connect(url, options)
        console.log("MongoDB Connected")
    }
    catch(err) {
        console.log('Database Error : ' + err)
    }
}

module.exports = { database }