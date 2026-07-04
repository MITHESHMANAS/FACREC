const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const AttendanceSession = require("../models/AttendanceSession");
const Attendance = require("../models/Attendance");

const getDashboardStats = async (req, res) => {

    try {

        const students = await Student.countDocuments();

        const faculty = await Faculty.countDocuments();

        const subjects = await Subject.countDocuments();

        const sessions = await AttendanceSession.countDocuments();

        const totalAttendance = await Attendance.countDocuments();

        const presentAttendance = await Attendance.countDocuments({
            status: "Present"
        });

        const attendance =
            totalAttendance === 0
                ? 0
                : Math.round((presentAttendance / totalAttendance) * 100);

        res.json({
            success: true,
            stats: {
                students,
                faculty,
                subjects,
                sessions,
                attendance
            }
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    getDashboardStats
};