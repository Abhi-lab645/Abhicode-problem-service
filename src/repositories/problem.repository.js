import { Problem } from "../models/index.js";
import InternalServerError from "../errors/internalServer.error.js";
import NotFoundError from "../errors/notFound.error.js";
import logger from "../config/logger.config.js";

class ProblemRepository {

    async createProblem(problemData) {

        try {

            const problem = await Problem.create({

                title: problemData.title,
                description: problemData.description,
                testCases: (problemData.testCases || []),
                difficulty: problemData.difficulty,
                editorial: problemData.editorial

            });

            return problem;

        } catch (error) {

            logger.error('createProblem: DB operation failed', { error });

            throw new InternalServerError(error);
        }
    }

    async getAllProblems() {

        try {

            const problems = await Problem.find({});

            return problems;

        } catch (error) {

            logger.error('getAllProblems: DB operation failed', { error });

            throw new InternalServerError(error);

        }
    }

    async getProblem(id) {

        try {

            const problem = await Problem.findById(id);

            if (!problem) {

                // Throws NotFoundError (404) directly

                throw new NotFoundError('Problem', { id });
            }

            return problem;


        } catch (error) {

            // Re-throw known errors (e.g. NotFoundError), wrap only unexpected DB errors
            if (error instanceof NotFoundError) throw error;

            logger.error('getProblem: DB operation failed', { error });

            throw new InternalServerError(error);

        }
    }

    async deleteProblem(id) {

        try {

            const deletedProblem = await Problem.findByIdAndDelete(id);

            if (!deletedProblem) {

                const err = new Error(`Problem with id:${id} not found in the db`);
                logger.error(err);  // Winston extracts message + stack cleanly
                // Throws NotFoundError (404) directly

                throw new NotFoundError('Problem', { id });
            }

            return deletedProblem;

        } catch (error) {

            if (error instanceof NotFoundError) throw error;

            logger.error('deleteProblem: DB operation failed', { error });

            throw new InternalServerError(error);

        }
    }

    async getProblemByTitle(title) {

        try {

            const problem = await Problem.findOne({ title });

            return problem;

        } catch (error) {

            logger.error('getProblemByTitle: DB operation failed', { error });

            throw new InternalServerError(error);

        }
    }

    async updateProblem(id, updatedData) {

        try {

            const updatedProblem = await Problem.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' });

            if (!updatedProblem) {

                throw new NotFoundError('Problem', { id });
            }

            return updatedProblem;

        } catch (error) {

            if (error instanceof NotFoundError) throw error;

            logger.error('updateProblem: DB operation failed', { error });

            throw new InternalServerError(error);

        }
    }
}

export default ProblemRepository;