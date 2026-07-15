const attendanceService = require("../services/attendanceService");

const markAttendance = async (req, res) => {

    try {

        const attendance = await attendanceService.markAttendance(req.body);

        res.status(201).json({
            success: true,
            attendance
        });

    }

    catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getAttendance = async (req, res) => {

    try {

        const attendance = await attendanceService.getAttendance({
            session: req.query.session
        });

        res.json({
            success: true,
            count: attendance.length,
            attendance
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const deleteAttendance = async (req, res) => {

    try {

        await attendanceService.deleteAttendance(req.params.id);

        res.json({
            success: true,
            message: "Attendance Deleted Successfully"
        });

    }

    catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    markAttendance,
    getAttendance,
    deleteAttendance
};