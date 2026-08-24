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

async function getProblems(req, res, next) {

    try {

        const problems=await problemService.getAllProblems();

        return res.status(StatusCodes.OK).json({

            success:true,
            message:'Successfully fetched all the problems',
            err:{},
            data:problems
        });

        

    } catch (error) {

        next(error);
    }

}

async function deleteProblem(req, res, next) {

    try {

        const deletedProblem=await problemService.deleteProblem(req.params.id);

        return res.status(StatusCodes.OK).json({

            success:true,
            message:'Successfully deleted the problem',
            error:{},
            data:deletedProblem
  
        });

    } catch (error) {

        next(error);
    }
}

async function updateProblem(req, res, next) {

    try {

        const updatedProblem = await problemService.updateProblem(req.params.id, req.body);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated the problem',
            error: {},
            data: updatedProblem
        });

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


/**
 * 
 * res
 * 
 * res.status -> returns the same response object with status property set
 * .json -> return the same response object which has status set but this json to be returned is also set
 * 
 */