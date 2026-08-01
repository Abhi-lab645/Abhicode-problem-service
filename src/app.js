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


app.use('/api',apiRouter);


app.use(errorHandler);


export default app;




