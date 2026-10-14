import express from 'express';
import { problemController } from '../../controllers/index.js';

const problemRouter = express.Router();

problemRouter.get('/ping', problemController.pingProblemController);
problemRouter.get('/', problemController.getProblems);
problemRouter.get('/:id', problemController.getProblem);
problemRouter.post('/', problemController.addProblem);
problemRouter.put('/:id', problemController.updateProblem);
problemRouter.delete('/:id', problemController.deleteProblem);

export default problemRouter;