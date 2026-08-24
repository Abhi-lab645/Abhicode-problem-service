import express from 'express';

import apiRouter from './routes/index.js';

import errorHandler from './utils/errorHandler.js';


const app=express();




// Parse incoming JSON request body

app.use(express.json());

// Parse URL Encoded form data

app.use(express.urlencoded({extended:true}));

// Parse plain text
app.use(express.text());

// Parse raw binary data (Buffer)
app.use(express.raw());

// if any request comes and route start with '/api' then send it to apiRouter 
app.use('/api',apiRouter);

// Register global error handler middleware
app.use(errorHandler);

export default app;
