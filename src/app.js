import express from 'express';
import cors from 'cors';

import apiRouter from './routes/index.js';
import errorHandler from './utils/errorHandler.js';

const app = express();

// Enable Cross-Origin Resource Sharing for frontend
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON request body
app.use(express.json());

// Parse URL Encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse plain text
app.use(express.text());

// Parse raw binary data (Buffer)
app.use(express.raw());

// Healthcheck routes
app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: 'Abhicode Problem Service is up and running'
    });
});

app.get('/ping', (req, res) => {
    return res.json({
        success: true,
        message: 'Problem service is alive'
    });
});

// If any request starts with '/api' send it to apiRouter
app.use('/api', apiRouter);

// Register global error handler middleware
app.use(errorHandler);

export default app;
