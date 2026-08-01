import { StatusCodes } from "http-status-codes";
import NotImplementedError from "../errors/notImplemented.error.js";

import BadRequestError from "../errors/badRequest.error.js";



function pingProblemController(req, res) {

    return res.json({

        message: 'ping controller is up'
    });
}

function addProblem(req, res, next) {

    try {

        throw new BadRequestError('Problem Name', { missing: ['Problem Name'] })

    } catch (error) {

        next(error);
    }

}

function getProblem(req, res) {

    return res.status(StatusCodes.NOT_IMPLEMENTED).json({

        message: 'Not implemented'
    });

}

function getProblems(req, res) {

    return res.status(StatusCodes.NOT_IMPLEMENTED).json({

        message: 'Not implemented'
    });

}

function deleteProblem(req, res) {

    return res.status(StatusCodes.NOT_IMPLEMENTED).json({

        message: 'Not implemented'
    });
}

function updateProblem(req, res) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({

        message: 'Not implemented'
    });
}


export default {
    addProblem,
    getProblem,
    getProblems,
    deleteProblem,
    updateProblem,
    pingProblemController
}