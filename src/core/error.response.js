'use strict';

const STATUSCODE = {
	FORBIDEN: 403,
	CONFLICT: 409,
	SERVERERROR: 500,
};

const REASONSTATUSCODE = {
	FORBIDEN: 'Bad Request Error',
	CONFLICT: 'Conflict Error',
	SERVERERROR: 'Internal Server Error',
};

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}


export default { ErrorResponse }