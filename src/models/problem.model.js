import mongoose from "mongoose";

const problemSchema=new mongoose.Schema({

    title:{
        type:String,
        required:[true,'Title cannot be empty'],       
    },

    description:{
        type:String,
        required:[true,'Description cannot be empty']
    },

    difficulty:{
        type:String,
        required:[true,'Difficulty cannot be empty'],
        enum:['easy','medium','hard'],
        default:'easy'
    },

    testCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ],

    editorial:{
        type:String
    }


});

const Problem=mongoose.model('Problem',problemSchema);

export default Problem;

