const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
{
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },

    session:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AttendanceSession",
        required:true
    },

    status:{
        type:String,
        enum:["Present","Absent"],
        default:"Present"
    },

    markedAt:{
        type:Date,
        default:Date.now
    }

},
{
    timestamps:true
});

module.exports=mongoose.model(
    "Attendance",
    attendanceSchema
);



