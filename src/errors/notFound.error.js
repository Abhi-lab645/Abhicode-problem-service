import BaseError from "./base.error.js";

import { StatusCodes } from "http-status-codes";

class NotFoundError extends BaseError{

    constructor(resourceName,details={}){

        super(

            'NotFoundError',
            StatusCodes.NOT_FOUND,
            `The requested resource ${resourceName} was not found`,
            details

        );
    }
}


export default NotFoundError;
