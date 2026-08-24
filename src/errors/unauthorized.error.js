import BaseError from "./base.error.js";

import { StatusCodes } from "http-status-codes";

class UnauthorizedError extends BaseError{

    constructor(details={}){

        super(
            'UnauthorizedError',
            StatusCodes.UNAUTHORIZED,
            "User is not authorized to access this resource",
            details
        );
    }

}

export default UnauthorizedError;