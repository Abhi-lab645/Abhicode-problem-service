try {
    process.loadEnvFile();
} catch {
    // In cloud/serverless environments (like Vercel), environment variables are provided directly in process.env
}

const PORT = process.env.PORT || 3001;

const MONGODB_URL = process.env.MONGODB_URL || process.env.ATLAS_DB_URL;

const MONGODB_LOGS_URL = process.env.MONGODB_LOGS_URL || MONGODB_URL;

export {
    PORT,
    MONGODB_URL,
    MONGODB_LOGS_URL
};


