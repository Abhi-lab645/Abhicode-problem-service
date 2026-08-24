import { Problem } from "../models/index.js";
import InternalServerError from "../errors/internalServer.error.js";
import NotFoundError from "../errors/notFound.error.js";

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

            throw new InternalServerError(error);
        }
    }

    async getAllProblems() {

        try {

            const problems = await Problem.find({});

            return problems;

        } catch (error) {

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

            // Wraps CastError (invalid ObjectId format) or DB connection error

            throw new InternalServerError(error);

        }
    }

    async deleteProblem(id) {

        try {

            const deletedProblem = await Problem.findByIdAndDelete(id);

            if (!deletedProblem) {
                // Throws NotFoundError (404) directly

                throw new NotFoundError('Problem', { id });
            }

            return deletedProblem;

        } catch (error) {

            throw new InternalServerError(error);

        }
    }

    async getProblemByTitle(title){

        try{

            const problem=await Problem.findOne({title});

            return problem;

        }catch(error){

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

            throw new InternalServerError(error);

        }
    }
}

export default ProblemRepository;