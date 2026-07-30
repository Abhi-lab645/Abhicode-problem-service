import express from 'express';

import v1Router from './v1/index.js';

const apiRouter = express.Router();

// if any request comes and route contiues  with '/v1' then send it to v1Router 
apiRouter.use('/v1', v1Router)


export default apiRouter;