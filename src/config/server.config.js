process.loadEnvFile();


const PORT=process.env.PORT || 3000;

const MONGODB_URL=process.env.MONGODB_URL;


export {
    PORT,
    MONGODB_URL
};


