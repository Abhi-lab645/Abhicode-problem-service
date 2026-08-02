import connectDb from "./config/db.config.js";

import app from "./app.js";

import {PORT} from './config/server.config.js';


app.get('/ping',(req,res)=>{

    return res.json({

        message:'Problem service is alive'
    });
})



const startServer=async ()=>{

    try{

        // Connect MongoDB

        await connectDb();

        console.log("✅ Database Connected Successfully");

        // Start Express Server

        app.listen(PORT,()=>{

            console.log("==================================");
            console.log(`🚀 Server Running on Port ${PORT}`);
            console.log("==================================");

        });

    }catch(error){

        console.error("❌ Unable to Start Server");

        console.error(error.message);

        // Exit node process

        process.exit(1);

    }
}

// Execute application

startServer();