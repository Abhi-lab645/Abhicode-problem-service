import { BadRequestError, ConflictError } from "../errors/index.js";
import { sanitizeMarkdownContent, validateAndNormalizeTopics } from "../utils/index.js";

class ProblemService {

    constructor(problemRepository) {
        this.problemRepository = problemRepository;
    }

    async createProblem(problemData) {
        // Disallow client-provided problemId
        delete problemData.problemId;
        delete problemData._id;

        // 1. Business Logic Validation (Fail Fast)
        if (!problemData.title || typeof problemData.title !== 'string' || problemData.title.trim().length === 0) {
            throw new BadRequestError('title', {
                reason: 'Title cannot be empty'
            });
        }
        problemData.title = problemData.title.trim();

        if (!problemData.description || typeof problemData.description !== 'string' || problemData.description.trim().length === 0) {
            throw new BadRequestError('description', {
                reason: 'Description cannot be empty'
            });
        }

        if (problemData.difficulty) {
            const normalizedDifficulty = problemData.difficulty.toLowerCase().trim();
            if (!['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
                throw new BadRequestError('difficulty', {
                    reason: 'Difficulty must be one of: easy, medium, hard'
                });
            }
            problemData.difficulty = normalizedDifficulty;
        }

        // Validate and normalize topics
        if (problemData.topics !== undefined) {
            problemData.topics = validateAndNormalizeTopics(problemData.topics);
        } else {
            problemData.topics = [];
        }

        // 2. Check for business conflicts (e.g., duplicate title)
        const existingProblem = await this.problemRepository.getProblemByTitle(problemData.title);
        if (existingProblem) {
            throw new ConflictError({
                reason: `Problem with title '${problemData.title}' already exists`
            });
        }

        // 3. Sanitize the markdown for description
        problemData.description = sanitizeMarkdownContent(problemData.description);

        const problem = await this.problemRepository.createProblem(problemData);
        return problem;
    }

    async getAllProblems(searchQuery) {
        const problems = await this.problemRepository.getAllProblems(searchQuery);
        return problems;
    }

    async getProblem(id) {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new BadRequestError('id', {
                reason: 'Problem identifier must be provided'
            });
        }
        const problem = await this.problemRepository.getProblem(id.trim());
        return problem;
    }

    async deleteProblem(id) {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new BadRequestError('id', {
                reason: 'Problem identifier must be provided'
            });
        }
        const problem = await this.problemRepository.deleteProblem(id.trim());
        return problem;
    }

    async updateProblem(id, updatedData) {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new BadRequestError('id', {
                reason: 'Problem identifier must be provided'
            });
        }

        // Prevent client overwrite of immutable identifiers
        delete updatedData._id;
        delete updatedData.problemId;

        if (updatedData.title !== undefined) {
            if (typeof updatedData.title !== 'string' || updatedData.title.trim().length === 0) {
                throw new BadRequestError('title', {
                    reason: 'Title cannot be empty'
                });
            }
            updatedData.title = updatedData.title.trim();

            // Check if title is being changed to an existing title of another problem
            const existingProblem = await this.problemRepository.getProblemByTitle(updatedData.title);
            if (existingProblem && existingProblem._id.toString() !== id && existingProblem.problemId !== id) {
                throw new ConflictError({
                    reason: `Problem with title '${updatedData.title}' already exists`
                });
            }
        }

        if (updatedData.description !== undefined) {
            if (typeof updatedData.description !== 'string' || updatedData.description.trim().length === 0) {
                throw new BadRequestError('description', {
                    reason: 'Description cannot be empty'
                });
            }
            updatedData.description = sanitizeMarkdownContent(updatedData.description);
        }

        if (updatedData.difficulty !== undefined) {
            const normalizedDifficulty = String(updatedData.difficulty).toLowerCase().trim();
            if (!['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
                throw new BadRequestError('difficulty', {
                    reason: 'Difficulty must be one of: easy, medium, hard'
                });
            }
            updatedData.difficulty = normalizedDifficulty;
        }

        // Handle topics update:
        // If topics is provided in the update payload, validate and update.
        // If topics is an empty array [], it intentionally clears topics.
        // If topics is omitted (undefined), do NOT touch existing topics.
        if (updatedData.topics !== undefined) {
            updatedData.topics = validateAndNormalizeTopics(updatedData.topics);
        }

        const updatedProblem = await this.problemRepository.updateProblem(id.trim(), updatedData);
        return updatedProblem;
    }
}

export default ProblemService;