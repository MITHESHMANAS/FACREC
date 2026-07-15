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

// Belt-and-braces duplicate prevention: markAttendance already checks
// for an existing record before creating one, but that check-then-create
// has a race window under concurrent requests. This unique index makes
// duplicates impossible at the database level regardless of app logic.
attendanceSchema.index(
    { student: 1, session: 1 },
    { unique: true }
);

module.exports=mongoose.model(
    "Attendance",
    attendanceSchema
);



