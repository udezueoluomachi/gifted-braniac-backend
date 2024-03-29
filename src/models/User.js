const mongoose = require("mongoose");
const Error = require('../error/errors')

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
	}],
    session : {
        required : true,
        type : String,
        enum : ["Hybrid session", "Morning session", "Afternoon session"]
    }
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