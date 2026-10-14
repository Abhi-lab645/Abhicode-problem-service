import mongoose from 'mongoose';

import { MONGODB_URL } from './server.config.js';


let cachedPromise = null;

async function connectDb() {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (!cachedPromise) {
        cachedPromise = mongoose.connect(MONGODB_URL, {
            bufferCommands: false,
        }).then((m) => {
            console.log("✅ Database Connected Successfully");
            return m;
        }).catch((err) => {
            cachedPromise = null;
            console.error("❌ Unable to connect to DB server:", err.message);
            throw err;
        });
    }

    return cachedPromise;
}

export default connectDb;


