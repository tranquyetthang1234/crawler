'use strict';

const STATUSCODE = {
	OK: 200,
	CREATED: 201,
};

const REASONSTATUSCODE = {
	OK: 'Success',
	CREATED: 'Created!',
};

class ResponseSuccess {
    constructor({ status = 200, message, reasonStatusCode = "OK", data = {} }) {
      this.status = status;
      this.message = !message ? reasonStatusCode : message;
      this.data = data;
    }
  
    send(response) {
      response.status(this.status).json(this);
    }
}

class SEND extends ResponseSuccess {
	constructor({ options = {}, message, data , status }) {
		console.log({ options, message, data, status })
		super({ message, data, status });
		this.options = options;
	}
}

class CREATED extends ResponseSuccess {
	constructor({
		options = {},
		message,
		statusCode = STATUSCODE.CREATED,
		reasonStatusCode = REASONSTATUSCODE.CREATED,
		data,
	}) {
		super({ message, statusCode, reasonStatusCode, data });
		this.options = options;
	}
}
  

export default SEND
