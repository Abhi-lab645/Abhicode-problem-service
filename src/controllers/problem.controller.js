import { StatusCodes } from "http-status-codes";
import NotImplementedError from "../errors/notImplemented.error.js";
import {ProblemService} from '../services/index.js';
import {ProblemRepository} from '../repositories/index.js';

const problemRepository=new ProblemRepository();
const problemService=new ProblemService(problemRepository)


function pingProblemController(req, res) {

    return res.json({

        message: 'ping controller is up'
    });
}

async function addProblem(req, res, next) {

    try {

        const newProblem=await problemService.createProblem(req.body);

        return res.status(StatusCodes.CREATED).json({

            success:true,
            message:`successfully created a new problem`,
            error:{},
            data:newProblem
        });


    } catch (error) {

        next(error);
    }

}

async function getProblem(req, res, next) {

    try {

        const problem=await problemService.getProblem(req.params.id);

        return res.status(StatusCodes.OK).json({

            success:true,
            message:'Successfully fetched a problem',
            error:{},
            data:problem
        });

    } catch (error) {

        next(error);
    }

}

function getProblems(req, res, next) {

    try {

        

    } catch (error) {

        next(error);
    }

}

function deleteProblem(req, res, next) {

    try {

        throw new NotImplementedError('delete Problem');

    } catch (error) {

        next(error);
    }
}

function updateProblem(req, res, next) {

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