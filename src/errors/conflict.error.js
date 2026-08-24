import BaseError from "./base.error.js";

import { StatusCodes } from "http-status-codes";

class ConflictError extends BaseError{

    constructor(details={}){

        super(

            "ConflictError",
            StatusCodes.CONFLICT,
            "A conflict occurred with the current state of the resource",
            details
        );

    }
}

export default ConflictError;