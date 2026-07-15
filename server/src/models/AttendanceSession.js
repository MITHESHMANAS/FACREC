const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
{
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },

    faculty: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        default: null
    },

status: {
    type: String,
    enum: ["SCHEDULED", "ACTIVE", "ENDED"],
    default: "SCHEDULED"
},

    expectedStudents: {
        type: Number,
        default: 0
    },

    presentStudents: {
        type: Number,
        default: 0
    },

    absentStudents: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "AttendanceSession",
    attendanceSessionSchema
);