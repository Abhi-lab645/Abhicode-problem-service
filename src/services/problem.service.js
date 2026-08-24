import {BadRequestError,ConflictError} from "../errors/index.js";
import { sanitizeMarkdownContent } from "../utils/index.js";

class ProblemService {

    constructor(problemRepository){

        this.problemRepository=problemRepository;
    }

    async createProblem(problemData){

        

        // 1. Business Logic Validation (Fail Fast)

        if(!problemData.title){

            throw new BadRequestError('title',{

                reason:'Title cannot be empty'
            });
        }

        if(!problemData.description){

            throw new BadRequestError('description',{

                reason:'Description cannot be empty'
            });
        }

        // 2. Check for business conflicts (e.g., duplicate title)

        // (Note: requires implementing getProblemByTitle in your repository)

        const existingProblem=await this.problemRepository.getProblemByTitle(problemData.title);

        if(existingProblem){

            throw new ConflictError({
                reason: `Problem with title '${problemData.title}' already exists`
            });
        }

        // 1. Sanitize the markdown for description
    
        problemData.description=sanitizeMarkdownContent(problemData.description);
    
        const problem=await this.problemRepository.createProblem(problemData);
    
        return problem;


    }
    
    async getAllProblems(){

        const problems=await this.problemRepository.getAllProblems();

        return problems;
    }

    async getProblem(id){

        const problem=await this.problemRepository.getProblem(id);

        return problem;
    }

    async deleteProblem(id){

        const problem=await this.problemRepository.deleteProblem(id);

        return problem;
    }

    async updateProblem(id, updatedData) {
        
        if (updatedData.description) {
            updatedData.description = sanitizeMarkdownContent(updatedData.description);
        }

        const updatedProblem = await this.problemRepository.updateProblem(id, updatedData);
        
        return updatedProblem;
    }
}

export default ProblemService; 