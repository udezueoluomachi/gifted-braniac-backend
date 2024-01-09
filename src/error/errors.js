const StatusCode = require('http-status-codes')

class Error {
	constructor(code, statusMessage, message, error) {
		this.status = code;
		this.statusMessage = statusMessage
		this.message = message
		this.success = false
		this.error = error
	}

	static badRequest(message, error) {
		return new Error(StatusCode.BAD_REQUEST, "Bad Request!", message, error)
	}

	static unauthorizedRequest(message, error) {
		return new Error(StatusCode.UNAUTHORIZED, "Unauthorized Request!", message, error)
	}

	static continueRequest(message, error) {
		return new Error(StatusCode.CONTINUE, "Continue!", message, error)
	}

	static internalServerError(message, error) {
		return new Error(StatusCode.INTERNAL_SERVER_ERROR, "Internal Server Error!", message, error)
	}

	static sessionExpired(message, error) {
		return new Error(440, "Session Expired!", message, error)
	}
}

module.exports = Error