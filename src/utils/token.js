const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Admin = require("./../models/Admin");
const seeders = require('./../config/seeders')
const Error = require('../error/errors');


module.exports.generateAccessToken = async function (payload) {
    const accessToken = jwt.sign({ _id: payload._id, deviceHash: payload.fingerprint.hash }, seeders.ACCESS_TOKEN_SECRET, { expiresIn: seeders.JWT_EXPIREIN_DATE })
    const user = await User.findById(payload._id)
    if (!user) return Error.badRequest('theres no user with this id', payload._id)
    user.accessTokens.push({
        accessToken: accessToken,
        deviceName: payload.fingerprint?.components?.useragent?.device?.family,
        browserName: payload.fingerprint?.components?.useragent?.browser?.family,
        osName: payload.fingerprint?.components?.useragent?.os?.family,
        country: payload.fingerprint?.components?.useragent?.geoip?.country,
        resion: payload.fingerprint?.components?.useragent?.geoip?.resion,
        city: payload.fingerprint?.components?.useragent?.geoip?.city
    })
    await user.save()

    return accessToken
}

module.exports.generateAdminAccessToken = async function (payload) {
    const accessToken = jwt.sign({ _id: payload._id, deviceHash: payload.fingerprint.hash }, seeders.ACCESS_TOKEN_SECRET, { expiresIn: seeders.JWT_EXPIREIN_DATE })
    const admin = await Admin.findById(payload._id)
    if (!admin) return Error.badRequest('theres no admin with this id', payload._id)
    admin.accessToken = accessToken;
    await admin.save()

    return accessToken
}

module.exports.validateAccessToken = async function (accessToken) {
    const user = await User.findOne({ "accessTokens.accessToken": accessToken })

    if (!user) return Error.unauthorizedRequest('Invalid access token!')

    try {
        const extractedPayload = jwt.verify(accessToken, seeders.ACCESS_TOKEN_SECRET)
        if (String(extractedPayload._id) !== String(user._id))
            return Error.unauthorizedRequest('invalid access token!')
    } catch (error) {
        // deleting the accessToken from users database
        await deleteAccessToken(accessToken)

        error.message = error.name === 'TokenExpiredError' ? "Session Expired! access token deleted" : error.message
        return "TokenExpiredError" ? Error.sessionExpired(error.message) : Error.unauthorizedRequest(error.message)
    }
    return user
}

module.exports.validateAdminAccessToken = async function (accessToken) {
    const admin = await Admin.findOne({ accessToken : accessToken })

    if (!admin) return Error.unauthorizedRequest('Invalid access token!')

    try {
        const extractedPayload = jwt.verify(accessToken, seeders.ACCESS_TOKEN_SECRET)
        if (String(extractedPayload._id) !== String(admin._id))
            return Error.unauthorizedRequest('invalid access token!')
    } catch (error) {
        // deleting the accessToken from users database
        await deleteAccessToken(accessToken)

        error.message = error.name === 'TokenExpiredError' ? "Session Expired! access token deleted" : error.message
        return "TokenExpiredError" ? Error.sessionExpired(error.message) : Error.unauthorizedRequest(error.message)
    }
    return admin
}

const deleteAccessToken = async function (accessToken) {
    const user = await User.findOne({ "accessTokens.accessToken": accessToken })
    if (!user)
        return Error.badRequest('Invalid Access Token!')

    user.accessTokens = user.accessTokens.filter(token => String(token.accessToken) !== String(accessToken))
    await user.save()
    return true
}

module.exports.deleteAccessToken = deleteAccessToken

module.exports.extractAccessToken = async function (tokenHeader) {
    if (!tokenHeader.startsWith('Bearer'))
        return Error.badRequest('authorization header should start with the Bearer string followed by a space and the access token!')
    const accessToken = tokenHeader.split(' ')[1]
    return accessToken
}

module.exports.generateJwtToken = (payload, expiresIn = seeders.JWT_EXPIREIN_DATE) => {
    const token = jwt.sign(payload, seeders.ACCESS_TOKEN_SECRET, { expiresIn: expiresIn });
  
    return token;
}

module.exports.verifyJwtToken = (token) => {
    try {
      const decoded = jwt.verify(token, seeders.ACCESS_TOKEN_SECRET);
      return decoded;
    } catch (error) {
      return false;
    }
} 