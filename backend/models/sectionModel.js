const mongoose = require("mongoose")

const sectionSchema = new mongoose.Schema({

   sectionName:{
      type:String,
      required:true
   },

   subSections:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"SUBSECTION"
      }
   ],


});

module.exports = mongoose.model('SECTION',sectionSchema);

