import mongoose from "mongoose";
import { Problem, Counter } from "../models/index.js";
import InternalServerError from "../errors/internalServer.error.js";
import NotFoundError from "../errors/notFound.error.js";
import logger from "../config/logger.config.js";
import { formatProblemId, isPublicProblemId, escapeRegex } from "../utils/index.js";

class ProblemRepository {

    /**
     * Create a new problem with an atomically assigned public problemId.
     * Retries automatically if a sequence conflict occurs.
     *
     * @param {Object} problemData
     * @returns {Promise<Object>}
     */
    async createProblem(problemData) {
        const MAX_RETRIES = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // If problemId is not already assigned (normal flow), generate it atomically
                let assignedId = problemData.problemId;
                if (!assignedId) {
                    const seq = await Counter.getNextSequence('problemId');
                    assignedId = formatProblemId(seq);
                }

                const problem = await Problem.create({
                    problemId: assignedId,
                    title: problemData.title,
                    description: problemData.description,
                    testCases: problemData.testCases || [],
                    difficulty: problemData.difficulty,
                    topics: problemData.topics || [],
                    editorial: problemData.editorial
                });

                return problem;

            } catch (error) {
                lastError = error;

                // If duplicate key error (code 11000) on problemId, retry with next sequence
                if (error.code === 11000 && error.keyPattern && error.keyPattern.problemId) {
                    logger.warn(`createProblem: Collision on problemId (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
                    // Unset problemData.problemId so a fresh sequence number is allocated on retry
                    problemData.problemId = undefined;
                    continue;
                }

                logger.error('createProblem: DB operation failed', { error });
                throw new InternalServerError(error);
            }
        }

        logger.error('createProblem: Exceeded maximum retries for problemId assignment', { error: lastError });
        throw new InternalServerError(lastError);
    }

    /**
     * Get all problems, optionally filtered by a search query (by public ID or title substring).
     *
     * @param {string} [searchQuery]
     * @returns {Promise<Array>}
     */
    async getAllProblems(searchQuery) {
        try {
            let filter = {};

            if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
                const trimmedQuery = searchQuery.trim();

                if (isPublicProblemId(trimmedQuery)) {
                    // If matches public ID pattern, match problemId exact or title substring
                    filter = {
                        $or: [
                            { problemId: trimmedQuery.toUpperCase() },
                            { title: { $regex: escapeRegex(trimmedQuery), $options: 'i' } }
                        ]
                    };
                } else {
                    // Match title substring (case-insensitive)
                    filter = {
                        title: { $regex: escapeRegex(trimmedQuery), $options: 'i' }
                    };
                }
            }

            const problems = await Problem.find(filter).sort({ problemId: 1, createdAt: 1 });
            return problems;

        } catch (error) {
            logger.error('getAllProblems: DB operation failed', { error });
            throw new InternalServerError(error);
        }
    }

    /**
     * Find a problem by MongoDB ObjectId or human-friendly problemId (e.g. ABH-0001).
     *
     * @param {string} identifier
     * @returns {Promise<Object>}
     */
    async getProblem(identifier) {
        try {
            let problem = null;

            if (isPublicProblemId(identifier)) {
                problem = await Problem.findOne({ problemId: identifier.trim().toUpperCase() });
            } else if (mongoose.isValidObjectId(identifier)) {
                problem = await Problem.findById(identifier);
            } else {
                // Identifier is neither a valid ObjectId nor a valid public problemId
                throw new NotFoundError('Problem', { id: identifier });
            }

            if (!problem) {
                throw new NotFoundError('Problem', { id: identifier });
            }

            return problem;

        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('getProblem: DB operation failed', { error });
            throw new InternalServerError(error);
        }
    }

    /**
     * Delete a problem by MongoDB ObjectId or public problemId.
     *
     * @param {string} identifier
     * @returns {Promise<Object>}
     */
    async deleteProblem(identifier) {
        try {
            let deletedProblem = null;

            if (isPublicProblemId(identifier)) {
                deletedProblem = await Problem.findOneAndDelete({ problemId: identifier.trim().toUpperCase() });
            } else if (mongoose.isValidObjectId(identifier)) {
                deletedProblem = await Problem.findByIdAndDelete(identifier);
            } else {
                throw new NotFoundError('Problem', { id: identifier });
            }

            if (!deletedProblem) {
                const err = new Error(`Problem with id:${identifier} not found in the db`);
                logger.error(err);
                throw new NotFoundError('Problem', { id: identifier });
            }

            return deletedProblem;

        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('deleteProblem: DB operation failed', { error });
            throw new InternalServerError(error);
        }
    }

    /**
     * Find a problem by its exact title.
     *
     * @param {string} title
     * @returns {Promise<Object|null>}
     */
    async getProblemByTitle(title) {
        try {
            const problem = await Problem.findOne({ title });
            return problem;
        } catch (error) {
            logger.error('getProblemByTitle: DB operation failed', { error });
            throw new InternalServerError(error);
        }
    }

    /**
     * Find a problem by its exact public problemId.
     *
     * @param {string} problemId
     * @returns {Promise<Object|null>}
     */
    async getProblemByProblemId(problemId) {
        try {
            const problem = await Problem.findOne({ problemId: problemId.trim().toUpperCase() });
            return problem;
        } catch (error) {
            logger.error('getProblemByProblemId: DB operation failed', { error });
            throw new InternalServerError(error);
        }
    }

    /**
     * Update a problem by MongoDB ObjectId or public problemId.
     * Strips immutable fields (_id, problemId) from updatedData.
     *
     * @param {string} identifier
     * @param {Object} updatedData
     * @returns {Promise<Object>}
     */
    async updateProblem(identifier, updatedData) {
        try {
            // Prevent clients from overriding problemId or _id
            delete updatedData._id;
            delete updatedData.problemId;

            let filter = null;
            if (isPublicProblemId(identifier)) {
                filter = { problemId: identifier.trim().toUpperCase() };
            } else if (mongoose.isValidObjectId(identifier)) {
                filter = { _id: identifier };
            } else {
                throw new NotFoundError('Problem', { id: identifier });
            }

            const updatedProblem = await Problem.findOneAndUpdate(
                filter,
                updatedData,
                { returnDocument: 'after', runValidators: true }
            );

            if (!updatedProblem) {
                throw new NotFoundError('Problem', { id: identifier });
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