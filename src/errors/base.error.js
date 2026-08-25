class BaseError extends Error {

    constructor(name, statusCode, message, details) {

        super(message);
        this.name = name;
        this.statusCode = statusCode;
        this.details = details;

        // Captures stack from the actual throw site, not from BaseError
        Error.captureStackTrace(this, this.constructor);

    }

}

export default BaseError;