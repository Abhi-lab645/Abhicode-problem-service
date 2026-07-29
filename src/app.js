import express from 'express';

const app=express();


// Parse incoming JSON request body

app.use(express.json());

// Parse URL Encoded form data

app.use(express.urlencoded({extended:true}));


export default app;




