import app from "./app.js";

import {PORT} from './config/server.config.js';


app.get('/ping',(req,res)=>{

    return res.json({

        message:'Problem service is alive'
    });
})



app.listen(PORT,()=>{
    console.log(`🚀 Server Running on Port ${PORT}`);

});