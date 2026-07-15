const Subject = require("../models/Subject");
const Enrollment = require("../models/Enrollment");
const FacultySubject = require("../models/FacultySubject");
const AttendanceSession = require("../models/AttendanceSession");

const createSubject = async (data) => {

    return await Subject.create(data);

};

const getSubjects = async () => {

    // Adds two things the plain Subject.find() never exposed:
    // - enrolledCount: how many students are actively enrolled
    // - attendancePercentage: present/expected across all completed
    //   sessions for that subject (0 if the subject has no ended
    //   sessions yet, rather than dividing by zero)
    return await Subject.aggregate([

        {
            $lookup: {
                from: "enrollments",
                let: { subjectId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$subject", "$$subjectId"] },
                                    { $eq: ["$status", "ACTIVE"] }
                                ]
                            }
                        }
                    }
                ],
                as: "enrollments"
            }
        },

        {
            $lookup: {
                from: "attendancesessions",
                let: { subjectId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$subject", "$$subjectId"] },
                                    { $eq: ["$status", "ENDED"] }
                                ]
                            }
                        }
                    }
                ],
                as: "endedSessions"
            }
        },

        {
            $addFields: {
                enrolledCount: { $size: "$enrollments" },
                totalExpected: { $sum: "$endedSessions.expectedStudents" },
                totalPresent: { $sum: "$endedSessions.presentStudents" }
            }
        },

        {
            $addFields: {
                attendancePercentage: {
                    $cond: [
                        { $gt: ["$totalExpected", 0] },
                        {
                            $round: [
                                {
                                    $multiply: [
                                        { $divide: ["$totalPresent", "$totalExpected"] },
                                        100
                                    ]
                                },
                                1
                            ]
                        },
                        0
                    ]
                }
            }
        },

        {
            $project: {
                enrollments: 0,
                endedSessions: 0,
                totalExpected: 0,
                totalPresent: 0
            }
        },

        { $sort: { code: 1 } }

    ]);

};

const updateSubject = async (id, data) => {

    return await Subject.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};

const deleteSubject = async (id) => {

    const [
        activeEnrollments,
        activeAssignments,
        liveSessions
    ] = await Promise.all([

        Enrollment.countDocuments({ subject: id, status: "ACTIVE" }),

        FacultySubject.countDocuments({ subject: id, status: "ACTIVE" }),

        AttendanceSession.countDocuments({
            subject: id,
            status: { $in: ["SCHEDULED", "ACTIVE"] }
        })

    ]);

    if (activeEnrollments > 0 || activeAssignments > 0 || liveSessions > 0) {

        throw new Error(
            "Cannot delete this subject - it still has active " +
            "enrollments, faculty assignments, or scheduled/active " +
            "sessions. Remove those first."
        );

    }

    return await Subject.findByIdAndDelete(id);

};

module.exports = {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject
};
