const Enrollment = require("../models/Enrollment");
const Subject = require("../models/Subject");

// ======================================================
// Auto Enroll Student
// Finds every ACTIVE subject that matches the student's
// branch + semester and enrolls the student into each one.
// Called automatically right after a student is registered.
// branch/semester are read live from Student/Subject - never
// duplicated onto the Enrollment record itself.
// ======================================================

const autoEnrollStudent = async (student) => {

    const matchingSubjects = await Subject.find({
        branch: student.branch,
        semester: student.semester,
        isActive: true
    });

    if (!matchingSubjects.length) {
        return [];
    }

    const enrollments = [];

    for (const subject of matchingSubjects) {

        try {

            const enrollment = await Enrollment.findOneAndUpdate(
                {
                    student: student._id,
                    subject: subject._id
                },
                {
                    student: student._id,
                    subject: subject._id,
                    status: "ACTIVE"
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            enrollments.push(enrollment);

        } catch (err) {

            // Skip duplicates silently, surface anything else
            if (err.code !== 11000) {
                throw err;
            }

        }

    }

    return enrollments;

};

// ======================================================
// Get Enrollments (optionally filtered by subject/student)
// ======================================================

const getEnrollments = async (filters = {}) => {

    const query = {};

    if (filters.subject) {
        query.subject = filters.subject;
    }

    if (filters.student) {
        query.student = filters.student;
    }

    const enrollments = await Enrollment.find(query)
        .populate("student")
        .populate("subject")
        .sort({ createdAt: -1 });

    // Belt-and-suspenders: cascade delete now prevents new orphans,
    // but any Enrollment created before that fix existed can still
    // reference a Student/Subject that's since been hard-deleted.
    // populate() silently returns null for those instead of erroring,
    // which used to render as blank rows in the UI. Filter them out
    // here so the API never hands back a record it can't fully
    // resolve - the underlying orphaned documents get cleaned up by
    // `npm run cleanup-orphans` (server/scripts/cleanupOrphans.js).
    return enrollments.filter((e) => e.student && e.subject);

};

// ======================================================
// Get Enrolled Students for a Subject (ACTIVE only)
// Used by the attendance engine to calculate
// "Expected Students" when a session starts.
// ======================================================

const getEnrolledStudentIds = async (subjectId) => {

    const enrollments = await Enrollment.find({
        subject: subjectId,
        status: "ACTIVE"
    });

    return enrollments.map((e) => e.student.toString());

};

// ======================================================
// Manually Enroll / Remove / Transfer
// (kept available for admin overrides, bulk import, etc.)
// ======================================================

const enrollStudent = async (data) => {

    const existing = await Enrollment.findOne({
        student: data.student,
        subject: data.subject
    });

    if (existing) {
        throw new Error("Student is already enrolled in this subject");
    }

    return await Enrollment.create({
        student: data.student,
        subject: data.subject,
        status: data.status || "ACTIVE"
    });

};

const removeEnrollment = async (id) => {

    const enrollment = await Enrollment.findByIdAndUpdate(
        id,
        { status: "REMOVED" },
        { new: true }
    );

    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    return enrollment;

};

module.exports = {
    autoEnrollStudent,
    getEnrollments,
    getEnrolledStudentIds,
    enrollStudent,
    removeEnrollment
};
