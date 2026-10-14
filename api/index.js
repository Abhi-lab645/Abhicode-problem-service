import connectDb from '../src/config/db.config.js';
import app from '../src/app.js';

export default async function handler(req, res) {
    try {
        await connectDb();
    } catch (err) {
        console.error("MongoDB connection error in serverless handler:", err);
    }
    return app(req, res);
}
