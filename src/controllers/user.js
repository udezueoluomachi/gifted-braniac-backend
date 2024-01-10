const Error = require("../error/errors");
const User = require("../models/User");
const Schema = require("json-validace");
const {OK, CREATED, NOT_FOUND} = require("http-status-codes")
const { generateAccessToken,  } = require('../utils/token')
const { uploadFile, downloadFile } = require('../helpers/awsS3Upload');
const { validateImage } = require('../utils/validators');

module.exports.register = async (req, res, next) => {
    try {
		// validation schema
		const validationSchema = new Schema({
			firstName: { type: "string", required: true },
			lastName: { type: "string", required: true },
			email: { type: "email", required: true },
			phone: { type: "string", required: true , minLength: 11, maxLength : 11},
			session : {type : "string", required : true, enum : ["Hybrid session", "Morning session", "Afternoon session"]}
		})

		// body validation
		const result = validationSchema.validate(req.body)

		// check if body is valid
		if (result.error)
			return next(Error.badRequest('Invalid body parameter!', result.error))

		const validBody = result.data;

		// check if email address is in use
		const isEmailExist = await User.findOne({ email: validBody.email })

		// check if email is in use already
		if (isEmailExist)
			return next(Error.badRequest('this Email is already used!'))

        const user = await User.Create(validBody);

		const accessToken = await generateAccessToken({
			_id: user._id,
			fingerprint: req.fingerprint
		});
		if (accessToken instanceof Error) next(accessToken);

		user.accessTokens.push({
			accessToken : accessToken
		});

		await user.save() // save user to database


		res.status(CREATED).send({
			// successful response
			message: ` ~ ${validBody.phone || validBody.email} ~ user created successfully :)`,
			success: true,
			data: {  
				...user._doc,
				__v: undefined,
				password: undefined,
				createdAt: undefined,
				updatedAt: undefined,
				timestamp: {
					createdAt: user.createdAt,
					updatedAt: user.updatedAt
				},
			},
		});
    }
    catch(err) {
        return next(err)
    }
}

exports.login = async function (req, res, next) {
	try {
		// Login validation schema using json-validace
		const validationSchema = new Schema({
			phone: { type: "string", required: true },
			email: { type: "email", required: true }
		})
		// validate request body!
		const result = validationSchema.validate(req.body)
		if (result.error)
			return next(Error.badRequest('Invalid Body Parameter!', result.error))

		// verify login credential
		const verifiedUserCredentials = await User.findOne(result.data);
		

		if (!verifiedUserCredentials)
			return next(Error.badRequest('Invalid login credentials'));

		const user = verifiedUserCredentials;
			
		const accessToken = await generateAccessToken({
			_id: user._id,
			fingerprint: req.fingerprint
		});
		if (accessToken instanceof Error) next(accessToken);

		user.accessTokens.push({
			accessToken : accessToken
		});

		await user.save();


		res.status(OK).json({
			status: res.statusCode,
			success: true,
			data: {
				user: {
					...user._doc,
					accessTokens: undefined,
				},
				accessToken,
			},
		});
	} catch (error) {
		next({ error });
	}
};



module.exports.getUser = async function (req, res, next) {
	try {
		const { user } = req;


		res.status(OK).send({
			message: 'opeartion successful!',
			success: true,
			status: res.statusCode,
			data: {
				user: {
					...user._doc,
					accessTokens: undefined,
					__v: undefined,
				},
			},
		});
	} catch (error) {
		next(error);
	}
};


// add avatar controller 
module.exports.addAvatar = async function (req, res, next) {
	try {

		const validationSchema = new Schema({
			avatar : { type: "object", required: true, validate: validateImage }
		})

		const result = validationSchema.validate({avatar: req.file })
		// check if body is valid
		if (result.error)
			return next(Error.badRequest('you need to parse in an image file!', result.error))

		const avatarURL = await uploadFile({ avatar: req.file })
		req.user.avatarKey = avatarURL[0].Key
		req.user.avatar = `/api/v1/user/avatar/${req.user._id}`
		await req.user.save()
		res.status(OK).send({
			message: "avatar upload successfully!",
			success: true,
			data: {
				avatar: req.user.avatar
			}
		})
	} catch (error) {
		next({ error })
	}
}

// get user's avatar
module.exports.getAvatar = async function (req, res, next) {
	try {
		const { avatarKey } = await User.findOne({ _id: req.params.id })
		if (!avatarKey) return res.status(NOT_FOUND).send()

		const { s3, params } = downloadFile(avatarKey)
		const fileStream = await s3.getObject(params).createReadStream();
		res.status(OK)
		fileStream.pipe(res);
	} catch (error) {
		res.status(NOT_FOUND).send()
	}
}