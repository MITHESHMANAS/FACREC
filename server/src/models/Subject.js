const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
{
    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },

    name:{
        type:String,
        required:true
    },

    semester:{
        type:Number,
        required:true
    },

    branch:{
        type:String,
        required:true
    },

    faculty:{
        type:String,
        default:"Not Assigned"
    },

    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
}
);

module.exports=mongoose.model("Subject",subjectSchema);