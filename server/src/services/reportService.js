const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");

const {
    generateAttendancePDF
} = require("../utils/pdfGenerator");

const {
    generateAttendanceExcel
} = require("../utils/excelGenerator");

const generatePDFReport = async (sessionId = null) => {

    // Backward compatible: no sessionId -> fall back to the most
    // recently ended session (reports only ever make sense for a
    // finished session - see the status check below). Passing a
    // sessionId lets Reports generate a report for any specific
    // ended session.
    const session = sessionId
        ? await AttendanceSession.findById(sessionId).populate("subject")
        : await AttendanceSession.findOne({ status: "ENDED" })
            .sort({ updatedAt: -1 })
            .populate("subject");

    if (!session) {

        throw new Error(
            sessionId ? "Session not found." : "No completed session found."
        );

    }

    // Reports only make sense for a session that's actually finished -
    // expectedStudents/presentStudents/absentStudents are only
    // computed once completeSession runs, and a report for a session
    // still in progress would look final when it isn't.
    if (session.status !== "ENDED") {

        throw new Error(
            "This session hasn't ended yet. End the session before " +
            "generating a report."
        );

    }

    // Get attendance records
    const attendance = await Attendance.find({

        session: session._id

    })

    .populate("student")

    .populate({

        path: "session",

        populate: {

            path: "subject"

        }

    });

    if (attendance.length === 0) {

        throw new Error(
            "No attendance records found."
        );

    }

    // Generate PDF
    const pdf = await generateAttendancePDF(

        session,

        attendance

    );

    return {

        success: true,

        report: pdf,

        total: attendance.length,

        session

    };

};

const generateExcelReport = async (sessionId = null) => {

    const session = sessionId
        ? await AttendanceSession.findById(sessionId).populate("subject")
        : await AttendanceSession.findOne({ status: "ENDED" })
            .sort({ updatedAt: -1 })
            .populate("subject");

    if (!session)

        throw new Error(

            sessionId ? "Session not found." : "No completed session found."

        );

    if (session.status !== "ENDED") {

        throw new Error(
            "This session hasn't ended yet. End the session before " +
            "generating a report."
        );

    }

    const attendance = await Attendance

    .find({

        session: session._id

    })

    .populate("student")

    .populate({

        path: "session",

        populate: {

            path: "subject"

        }

    });

    const excel =

        await generateAttendanceExcel(

            session,

            attendance

        );

    return {

        success: true,

        report: excel

    };

};

module.exports = {

    generatePDFReport,

    generateExcelReport

};