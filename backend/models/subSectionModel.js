const mongoose = require("mongoose")

// subsction schema 

const subSectionSchema =
new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    videoUrl:{
         url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        }
    },

    timeDuration:{
        type:String
    }

},{
    timestamps:true
});

module.exports = mongoose.model('SUBSECTION',subSectionSchema);