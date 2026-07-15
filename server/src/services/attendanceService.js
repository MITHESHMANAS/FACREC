const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const enrollmentService = require("./enrollmentService");

const { getIO } = require("../socket/socket");

// ======================================================
// Mark Attendance
// ======================================================

const markAttendance = async (data) => {

    const session = await AttendanceSession.findById(data.session);

    if (!session) {
        throw new Error("Session not found.");
    }

    if (session.status === "ENDED") {
        throw new Error(
            "This session has ended. Ask an admin to reopen it before " +
            "making changes."
        );
    }

    // A student can only be marked present in a session if they're
    // actually enrolled in that session's subject. Without this check,
    // recognition or a manual mark could attach attendance to a
    // student who was never expected in the room - which then throws
    // off expectedStudents/presentStudents/absentStudents everywhere
    // downstream (reports, analytics, dashboard).
    const enrolledStudentIds = await enrollmentService.getEnrolledStudentIds(
        session.subject
    );

    if (!enrolledStudentIds.includes(data.student.toString())) {
        throw new Error(
            "This student is not enrolled in this session's subject."
        );
    }

    // One attendance record per (student, session) - this is also
    // enforced as a unique index at the DB level. Instead of treating
    // a second mark as an error, treat it as a correction: update the
    // existing record's status/markedAt. This is what makes
    // "reopen a session and fix an entry" actually work - without
    // this, reopening a locked session and trying to mark anyone
    // (manually or via recognition) would immediately fail with
    // "Attendance already marked" since the row from before ending
    // the session is still there.
    const existing = await Attendance.findOne({

        student: data.student,

        session: data.session

    });

    let attendance;
    let wasUpdated = false;

    if (existing) {

        // Nothing to do if the status isn't actually changing -
        // avoids a pointless write and a misleading "updated" event
        // every time the same face is re-recognized mid-session.
        if (existing.status === (data.status || "Present")) {

            attendance = existing;

        } else {

            existing.status = data.status || "Present";
            existing.markedAt = Date.now();

            attendance = await existing.save();

            wasUpdated = true;

        }

    } else {

        attendance = await Attendance.create(data);

    }

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

const getAttendance = async (filters = {}) => {

    const query = {};

    if (filters.session) {
        query.session = filters.session;
    }

    return await Attendance.find(query)

        .populate("student")

        .populate({

            path: "session",

            populate: {

                path: "subject"

            }

        })

        .sort({ markedAt: -1 });

};

// ======================================================
// Delete Attendance
// ======================================================

const deleteAttendance = async (id) => {

    const attendance = await Attendance.findById(id);

    if (!attendance) {
        throw new Error("Attendance record not found.");
    }

    const session = await AttendanceSession.findById(attendance.session);

    if (session && session.status === "ENDED") {
        throw new Error(
            "This session has ended. Ask an admin to reopen it before " +
            "making changes."
        );
    }

    return await Attendance.findByIdAndDelete(id);

};

module.exports = {

    markAttendance,

    getAttendance,

    deleteAttendance

};