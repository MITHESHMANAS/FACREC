const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const AttendanceSession = require("../models/AttendanceSession");
const RecognitionLog = require("../models/RecognitionLog");

const getDashboardStats = async (req, res) => {

    try {

        const [

            students,

            faculty,

            subjects,

            endedSessions,

            activeSession,

            recognitions

        ] = await Promise.all([

            Student.countDocuments({

                isActive: true

            }),

            Faculty.countDocuments({

                isActive: true

            }),

            Subject.countDocuments({

                isActive: true

            }),

            // Overall attendance % is meaningful only relative to how
            // many students were actually expected across sessions
            // that have finished (expectedStudents/presentStudents are
            // reliable snapshots computed when a session ends). A raw
            // count of "Present" attendance rows isn't a percentage
            // and was being rendered as one on the dashboard - this
            // fixes that at the source instead of patching the label.
            AttendanceSession.find({

                status: "ENDED"

            }).select("expectedStudents presentStudents"),

            AttendanceSession.findOne({

                status: "ACTIVE"

            })

            .populate("subject")

            .sort({

                createdAt: -1

            }),

            RecognitionLog.countDocuments()

        ]);

        const totalExpected = endedSessions.reduce(
            (sum, s) => sum + (s.expectedStudents || 0),
            0
        );

        const totalPresent = endedSessions.reduce(
            (sum, s) => sum + (s.presentStudents || 0),
            0
        );

        const attendancePercentage = totalExpected === 0
            ? 0
            : Number(((totalPresent / totalExpected) * 100).toFixed(1));

        res.json({

            success: true,

            stats: {

                students,

                faculty,

                subjects,

                attendancePercentage,

                completedSessions: endedSessions.length,

                recognitions,

                activeSession

            }

        });

    }

    catch (err) {

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};

module.exports={

    getDashboardStats

};