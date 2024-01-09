const Error = require('../error/errors');
const { generateAdminAccessToken, deleteAccessToken } = require('../utils/token');
// Models
const User = require('../models/User');
const Admin = require('../models/Admin');

const { OK, CREATED, NOT_FOUND } = require('http-status-codes');
const { Schema } = require('json-validace');

// Register with all data
module.exports.registration = async function (req, res, next) {
	try {

		// validation schema
		const validationSchema = new Schema({
			firstName: { type: "string", required: true },
			lastName: { type: "string", required: true },
			email: { type: "email", required: true },
			password: { type: "string", required: true, minLength: 8 },
		})

		// body validation
		const result = validationSchema.validate({ ...req.body})

		// check if body is valid
		if (result.error)
			return next(Error.badRequest('Invalid body parameter!', {
				...result.error
			}))

		const validBody = result.data;

		// check if email address is in use
		const isEmailExist = await Admin.findOne({ email: validBody.email })

		// check if email is in use already
		if (isEmailExist)
			return next(Error.badRequest('this Email is already used!'))


		// create new user instance
		const admin = await Admin.create(validBody)
		
		const accessToken = await generateAdminAccessToken({
			_id: admin._id,
			fingerprint: req.fingerprint
		});
		if (accessToken instanceof Error) next(accessToken);

        admin.accessToken = accessToken;
        await admin.save()


        res.status(CREATED).send({
            success : true,
            message : "Registration successful",
            data : {
                admin : {...admin._doc, password : undefined}
            }
        })
	} catch (error) {
		next(error);
	}
};

module.exports.login = async (req, res, next) => {
    try {
        const validationSchema = new Schema({
            email : {
                type : "string",
                required : true
            },
            password : {
                type : "string",
                required : true
            }
        })

        const result = validationSchema.validate(req.body)
		if (result.error)
			return next(Error.badRequest('Invalid Body Parameter!', result.error))

        const {email , password} = result.data;

        // verify login credential
        const verifiedUserCredentials = await Admin.findOne({ password, email });

        if (!verifiedUserCredentials)
            return next(Error.badRequest('Invalid login credentials'));

        const admin = verifiedUserCredentials;

		const accessToken = await generateAdminAccessToken({
			_id: admin._id,
			fingerprint: req.fingerprint
		});
		if (accessToken instanceof Error) next(accessToken);

        admin.accessToken = accessToken;
        await admin.save()


        res.status(OK).send({
            success : true,
            message : "Login successful",
            data : {
                admin : {...admin._doc, password : undefined}
            }
        })
    }
    catch (error) {
        next(error)
    }
}

module.exports.getUsersAccounts = async (req, res, next) => {
    try {
        const users = await User.find({});

        const usersAccounts = await Promise.all(users.map(
            async e => {
                let fetchedUsers = {...e.toObject()};
                fetchedUsers.walletInfo = await Wallet.findOne({owner : fetchedUsers._id}) || null
                return fetchedUsers
            }
        ))
        
        
        res.status(OK).send({
            success : true,
            message : "Users fetched successfully",
            usersAccounts : usersAccounts || "Could not fetch users accounts",
        })
    }
    catch (error) {
        next(error)
    }
}

module.exports.getUserPersonalDetails = async (req, res, next) => {
    try {
        const validationSchema = new Schema({
            userId : {type : "mongoid", required : true}
        })

        const result = validationSchema.validate(req.params)
        if(result.error)
            return next(Error.badRequest("Invalid request parameters", result.error));

        const {userId} = result.data;

        const user = await User.findOne({_id : userId})

        if(!user)
            return res.status(NOT_FOUND).send({
                success : false,
                message : "No such user found"
            })
        
        res.status(OK).send({
            success : true,
            message : "User details fetched successfully",
            data : user._doc
        })
    }
    catch(error) {
        next(error)
    }
}