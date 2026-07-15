const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const RecognitionLog = require("../models/RecognitionLog");
const Student = require("../models/Student");

// ==========================================
// Recent Recognition
// ==========================================

const getRecentRecognition = async () => {

    return await RecognitionLog.find()

        .populate("student")

        .sort({

            capturedAt: -1

        })

        .limit(10);

};

// ==========================================
// Active Session
// ==========================================

const getActiveSession = async () => {

    return await AttendanceSession.findOne({

        status: "ACTIVE"

    })

    .populate("subject")

    .sort({

        createdAt: -1

    });

};

// ==========================================
// Top Performers
// ==========================================

const getTopPerformers = async () => {

    const students = await Student.find({

        isActive: true

    });

    const results = [];

    for (const student of students) {

        const total = await Attendance.countDocuments({

            student: student._id

        });

        const present = await Attendance.countDocuments({

            student: student._id,

            status: "Present"

        });

        const percentage =

            total === 0

            ? 0

            : ((present / total) * 100);

        results.push({

            _id: student._id,

            name: student.name,

            rollNo: student.rollNo,

            percentage: Number(

                percentage.toFixed(2)

            )

        });

    }

    return results

        .sort(

            (a,b)=>

            b.percentage-a.percentage

        )

        .slice(0,5);

};
// ==========================================
// Attendance Trend (Last 7 Days)
// ==========================================

const getAttendanceTrend = async () => {

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(

        sevenDaysAgo.getDate() - 6

    );

    const trend = await Attendance.aggregate([

        {

            $match: {

                markedAt: {

                    $gte: sevenDaysAgo

                }

            }

        },

        {

            $group: {

                _id: {

                    $dateToString: {

                        format: "%d-%m",

                        date: "$markedAt"

                    }

                },

                attendance: {

                    $sum: 1

                }

            }

        },

        {

            $sort: {

                _id: 1

            }

        }

    ]);

    return trend.map(item => ({

        day: item._id,

        attendance: item.attendance

    }));

};

module.exports = {

    getRecentRecognition,

    getActiveSession,

    getTopPerformers,

    getAttendanceTrend

};