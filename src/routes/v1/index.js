import express from 'express';

import problemRouter from './problems.routes.js';

const v1Router = express.Router();

// if any request comes and route contiues  with '/problems' then send it to v1Router

v1Router.use('/problems', problemRouter);

export default v1Router;




