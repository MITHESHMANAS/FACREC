const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");

const {
    generateAttendancePDF
} = require("../utils/pdfGenerator");

const {
    generateAttendanceExcel
} = require("../utils/excelGenerator");

const generatePDFReport = async () => {

    // Find active session
    const session = await AttendanceSession.findOne({
        status: "ACTIVE"
    }).populate("subject");

    if (!session) {

        throw new Error(
            "No active session found."
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

const generateExcelReport = async () => {

    const session = await AttendanceSession

    .findOne({

        status: "ACTIVE"

    })

    .populate("subject");

    if (!session)

        throw new Error(

            "No active session found."

        );

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