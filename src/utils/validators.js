const Error = require('../error/errors');
const { randomUUID } = require('crypto');
const { writeFileSync } = require('fs');
const { join } = require('path');

module.exports.validateAgeAgainstType = function (birthday, type) {
	const age = new AgeFromDate(new Date(birthday)).age
	type = type.toLowerCase()
	if (type === 'adult' && age < 25)
		return Error.badRequest("You are too young to signup as an Adult")
	else if (type === 'teen' && age >= 25)
		return Error.badRequest("you are too old to be signed in as a Teenager")
	return true
}

module.exports.ageType = function (birthday) {
	const age = new AgeFromDate(birthday).age
	return age < 25 ? "teen" : "25+adult"
}

module.exports.getAge = function (birthday) {
	return new AgeFromDate(new Date(birthday)).age
}


module.exports.modifyStringImageFile = function (base64String, path) {
	if (typeof base64String === 'string') {
		// extract keys from base64 string
		const mimetype = base64String.split(":")[1].split(';')[0]
		const ext = mimetype.split('/')[mimetype.split('/').length - 1]
		const originalname = Date.now().toString() + randomUUID() + Math.random() * 100000000 + '.' + ext

		// extract the base64 meta data
		base64String = base64String.split(';base64,').pop()
		const buffer = Buffer.from(base64String, 'base64')

		if (path)
			writeFileSync(`${path}/${originalname}`, buffer)

		// return data
		return {
			originalname,
			fieldname: "avatar",
			encoding: "7bit",
			path: path ? join(path, originalname) : undefined,
			mimetype,
			size: buffer.length,
			buffer: buffer
		}
	} else {
		return base64String
	}
}

// Validate image
module.exports.validateImage = function (value) {
	if (!["png", "jpeg", "jpg"].includes(value?.mimetype?.split('/')[1]))
		return { isValid: false, errMessage: "Please upload a valid photo!" };

	if (value?.size >= 1000000)
		return { isValid: false, errMessage: "Image is too big, image should be 40KB to 1MB" }
	else if (value.size <= 40000)
		return { isValid: false, errMessage: "Image is too small, image should be 40KB to 1MB" }

	else return { isValid: true }
}

module.exports.validateSpaceImages = function (values) {
	if(values.length < 3)
		return {isValid : false, errMessage : "Please upload at least 3 photos"}

	let returnValue = [];

	for(let i = 0; i <= values.length; i++) {
		if (!["png", "jpeg", "jpg"].includes(values[0]?.mimetype?.split('/')[1])) {
			returnValue[0] = { isValid: false, errMessage: "Please upload a valid photo!" };
			break;
		}
		else if (values[i]?.size >= 2000000) {
			returnValue[0]  = { isValid: false, errMessage: "Image is too big, image should be 40KB to 2MB" }
			break;
		}
		else if (values[i].size <= 40000) {
			returnValue[0]  = { isValid: false, errMessage: "Image is too small, image should be 40KB to 2MB" }
			break;
		}
	}

	if(returnValue.length > 0)
		return returnValue[0]

	return { isValid: true }
}