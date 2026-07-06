const Attendance = require("../models/Attendance");

const { getIO } = require("../socket/socket");

// ======================================================
// Mark Attendance
// ======================================================

const markAttendance = async (data) => {

    const alreadyMarked = await Attendance.findOne({

        student: data.student,

        session: data.session

    });

    if (alreadyMarked) {

        throw new Error("Attendance already marked.");

    }

    const attendance = await Attendance.create(data);

    const populatedAttendance = await Attendance.findById(

        attendance._id

    )

        .populate("student")

        .populate({

            path: "session",

            populate: {

                path: "subject"

            }

        });

    try {

        const io = getIO();

        io.emit(

            "attendanceMarked",

            {

                id: populatedAttendance._id,

                student: populatedAttendance.student,

                session: populatedAttendance.session,

                status: populatedAttendance.status,

                markedAt: populatedAttendance.markedAt

            }

        );

        console.log(

            "⚡ Attendance Event Broadcasted"

        );

    }

    catch (err) {

        console.log(

            "Socket not initialized."

        );

    }

    return populatedAttendance;

};

// ======================================================
// Get Attendance
// ======================================================

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

// ======================================================
// Delete Attendance
// ======================================================

const deleteAttendance = async (id) => {

    return await Attendance.findByIdAndDelete(id);

};

module.exports = {

    markAttendance,

    getAttendance,

    deleteAttendance

};