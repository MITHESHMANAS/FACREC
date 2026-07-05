const Attendance = require("../models/Attendance");

const markAttendance = async (data) => {

    const alreadyMarked = await Attendance.findOne({
        student: data.student,
        session: data.session
    });

    if (alreadyMarked) {
        throw new Error("Attendance already marked.");
    }

    return await Attendance.create(data);

};

const getAttendance = async () => {

    return await Attendance.find()
        .populate("student")
        .populate({
            path: "session",
            populate: {
                path: "subject"
            }
        });

};

const deleteAttendance = async (id) => {

    return await Attendance.findByIdAndDelete(id);

};

module.exports = {
    markAttendance,
    getAttendance,
    deleteAttendance
};