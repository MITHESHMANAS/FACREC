const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const Subject = require("../models/Subject");
const RecognitionLog = require("../models/RecognitionLog");

const getAnalytics = async () => {

    const totalStudents = await Student.countDocuments({
        isActive: true
    });

    const totalSessions = await AttendanceSession.countDocuments();

    const totalAttendance = await Attendance.countDocuments();

    const present = await Attendance.countDocuments({
        status: "Present"
    });

    const absent = await Attendance.countDocuments({
        status: "Absent"
    });

    const activeSessions = await AttendanceSession.countDocuments({
        status: "ACTIVE"
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayAttendance = await Attendance.countDocuments({
        markedAt: {
            $gte: today,
            $lt: tomorrow
        }
    });

    // Attendance Trend (last 30 days)
    const attendanceTrend = await Attendance.aggregate([
        {
            $match: {
                markedAt: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
                attendance: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Subject Distribution
    const subjectDistribution = await Attendance.aggregate([
        {
            $lookup: {
                from: "attendancesessions",
                localField: "session",
                foreignField: "_id",
                as: "session"
            }
        },
        { $unwind: "$session" },
        {
            $lookup: {
                from: "subjects",
                localField: "session.subject",
                foreignField: "_id",
                as: "subject"
            }
        },
        { $unwind: "$subject" },
        {
            $group: {
                _id: "$subject.name",
                value: { $sum: 1 }
            }
        }
    ]);

    // Branch Attendance
    const branchAttendance = await Student.aggregate([
        {
            $group: {
                _id: "$branch",
                students: { $sum: 1 }
            }
        }
    ]);

    // Attendance Shortage
    const shortageStudents = await Attendance.aggregate([
        {
            $lookup: {
                from: "students",
                localField: "student",
                foreignField: "_id",
                as: "student"
            }
        },
        { $unwind: "$student" },
        {
            $group: {
                _id: "$student.name",
                present: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Present"] },
                            1,
                            0
                        ]
                    }
                },
                total: { $sum: 1 }
            }
        },
        {
            $project: {
                student: "$_id",
                percentage: {
                    $multiply: [
                        { $divide: ["$present", "$total"] },
                        100
                    ]
                }
            }
        },
        {
            $match: {
                percentage: { $lt: 75 }
            }
        }
    ]);

    // Weekly Heatmap
    const weeklyHeatmap = await Attendance.aggregate([
        {
            $group: {
                _id: {
                    $dayOfWeek: "$markedAt"
                },
                attendance: { $sum: 1 }
            }
        }
    ]);

    // Recognition Statistics - computed from real RecognitionLog entries
    // (previously this was a hardcoded stub; now that every recognition
    // attempt is actually logged, we can report real numbers).
    const recognizedCount = await RecognitionLog.countDocuments({
        status: "RECOGNIZED"
    });

    const unknownCount = await RecognitionLog.countDocuments({
        status: "UNKNOWN"
    });

    const totalRecognitionAttempts = recognizedCount + unknownCount;

    const confidenceAgg = await RecognitionLog.aggregate([
        {
            $match: { status: "RECOGNIZED" }
        },
        {
            $group: {
                _id: null,
                avgConfidence: { $avg: "$confidence" }
            }
        }
    ]);

    const recognitionStats = {
        accuracy: totalRecognitionAttempts > 0
            ? Number(((recognizedCount / totalRecognitionAttempts) * 100).toFixed(1))
            : 0,
        averageConfidence: confidenceAgg.length > 0
            ? Number(confidenceAgg[0].avgConfidence.toFixed(1))
            : 0,
        unknownFaces: unknownCount,
        totalAttempts: totalRecognitionAttempts
    };

    // Session Summary - expected/present/absent per completed session,
    // so Reports/Analytics actually surface the numbers the attendance
    // engine already computes at session-end instead of leaving them
    // stranded on the AttendanceSession documents.
    const sessionSummary = await AttendanceSession.find({
        status: "ENDED"
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("subject")
        .select("subject date expectedStudents presentStudents absentStudents");

    return {
        success: true,

        totalStudents,
        totalSessions,
        totalAttendance,
        todayAttendance,

        present,
        absent,
        activeSessions,

        attendanceTrend,
        subjectDistribution,
        branchAttendance,
        shortageStudents,
        weeklyHeatmap,
        recognitionStats,
        sessionSummary

    };

};

module.exports = {
    getAnalytics
};