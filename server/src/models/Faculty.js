const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    employeeId:{
        type:String,
        required:true,
        unique:true
    },

    department:{
        type:String,
        required:true
    },

    designation:{
        type:String,
        default:"Assistant Professor"
    },

    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("Faculty",facultySchema);