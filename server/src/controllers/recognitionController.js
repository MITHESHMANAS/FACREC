const recognitionService = require("../services/recognitionService");

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");

const startRecognition = async (req, res) => {

    try {

        // Run Python Recognition
        const result = await recognitionService.startRecognition();

        if (!result.success) {

            return res.status(400).json(result);

        }

        // Active Session
        const session = await AttendanceSession.findOne({

            status: "ACTIVE"

        }).populate("subject");

        if (!session) {

            return res.status(400).json({

                success: false,

                message: "No active attendance session."

            });

        }

        let savedCount = 0;

        const attendanceRecords = [];

        for (const face of result.recognized) {

            const student = await Student.findOne({

                name: face.name,

                isActive: true

            });

            if (!student) {

                attendanceRecords.push({

                    name: face.name,

                    status: "Student Not Found"

                });

                continue;

            }

            const alreadyMarked = await Attendance.findOne({

                student: student._id,

                session: session._id

            });

            if (alreadyMarked) {

                attendanceRecords.push({

                    name: student.name,

                    status: "Already Marked"

                });

                continue;

            }

            const attendance = await Attendance.create({

                student: student._id,

                session: session._id,

                status: "Present"

            });

            savedCount++;

            attendanceRecords.push({

                name: student.name,

                status: "Present",

                attendanceId: attendance._id

            });

        }

        return res.status(200).json({

            success: true,

            session: {

                id: session._id,

                subject: session.subject?.name

            },

            recognized: result.recognized,

            attendance: attendanceRecords,

            totalRecognized: result.recognized.length,

            totalSaved: savedCount

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {
    startRecognition
};