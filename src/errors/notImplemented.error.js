import BaseError from "./base.error.js";

import { StatusCodes } from "http-status-codes";

class NotImplementedError extends BaseError{

    constructor(methodName){

        super(
            "NotImplementedError",
            StatusCodes.NOT_IMPLEMENTED, // 501
            `${methodName} Not Implemented`,
            {}
        );
    }

}


export default NotImplementedError;