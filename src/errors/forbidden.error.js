import BaseError from "./base.error.js";

import { StatusCodes } from "http-status-codes";

class ForbiddenError extends BaseError{

    constructor(details={}){

        super(
            'ForbiddenError',
            StatusCodes.FORBIDDEN,
            "Access to this resource is forbidden",
            details
        );
    }
}

export default ForbiddenError;
