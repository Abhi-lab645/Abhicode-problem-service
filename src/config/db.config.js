import mongoose from 'mongoose';

import { MONGODB_URL } from './server.config.js';


async function connectDb() {

    try{

        await mongoose.connect(MONGODB_URL);


    }catch(error){

        console.log(`Unable to connect to the DB server`);

        console.log(err);
    }
}

export default connectDb;


