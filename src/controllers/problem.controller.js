import { StatusCodes } from "http-status-codes";

import NotImplementedError from "../errors/notImplemented.error.js";





function pingProblemController(req, res) {

    return res.json({

        message: 'ping controller is up'
    });
}

function addProblem(req, res, next) {

    try {

        throw new NotImplementedError('Add Problem');

    } catch (error) {

        next(error);
    }

}

function getProblem(req, res,next) {

    try {

        throw new NotImplementedError('Get Problem');

    } catch (error) {

        next(error);
    }

}

function getProblems(req, res,next) {

    try {

        throw new NotImplementedError('Get Problems');

    } catch (error) {

        next(error);
    }

}

function deleteProblem(req, res,next) {

    try {

        throw new NotImplementedError('delete Problem');

    } catch (error) {

        next(error);
    }
}

function updateProblem(req, res,next) {

    try {

        throw new NotImplementedError('update Problem');

    } catch (error) {

        next(error);
    }
}


export default {
    addProblem,
    getProblem,
    getProblems,
    deleteProblem,
    updateProblem,
    pingProblemController
}