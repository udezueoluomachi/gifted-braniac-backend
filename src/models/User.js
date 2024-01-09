const mongoose = require("mongoose");
const Error = require('../error/errors')
const otpGenerator = require('otp-generator');

const userSchema = mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
	avatar : String,
	avatarKey : String,
	accessTokens: [{
		accessToken: {
			require: true,
			type: String
		}
	}]
}, {
	timestamps: true,
	toJSON: {
		transform(doc, ret) {
			delete ret.password
			delete ret.accessTokens
		}
	}
})

const User = mongoose.model("User", userSchema);

module.exports = User