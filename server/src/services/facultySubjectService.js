const FacultySubject = require("../models/FacultySubject");
const Faculty = require("../models/Faculty");

// ======================================================
// Assign a subject to a faculty member
// ======================================================

const assignSubject = async (data) => {

    const existing = await FacultySubject.findOne({
        faculty: data.faculty,
        subject: data.subject,
        academicYear: data.academicYear || null
    });

    if (existing) {

        if (existing.status === "ACTIVE") {
            throw new Error("Faculty is already assigned to this subject");
        }

        existing.status = "ACTIVE";
        await existing.save();
        return existing;

    }

    return await FacultySubject.create({
        faculty: data.faculty,
        subject: data.subject,
        academicYear: data.academicYear || null
    });

};

// ======================================================
// Remove (soft-deactivate) an assignment
// ======================================================

const removeAssignment = async (id) => {

    const assignment = await FacultySubject.findByIdAndUpdate(
        id,
        { status: "INACTIVE" },
        { new: true }
    );

    if (!assignment) {
        throw new Error("Assignment not found");
    }

    return assignment;

};

// ======================================================
// List assignments (optionally filtered)
// ======================================================

const getAssignments = async (filters = {}) => {

    const query = { status: "ACTIVE" };

    if (filters.faculty) {
        query.faculty = filters.faculty;
    }

    if (filters.subject) {
        query.subject = filters.subject;
    }

    return await FacultySubject.find(query)
        .populate("faculty")
        .populate("subject")
        .sort({ createdAt: -1 });

};

// ======================================================
// Get the set of subject IDs a faculty member is assigned to
// ======================================================

const getAssignedSubjectIds = async (facultyId) => {

    const assignments = await FacultySubject.find({
        faculty: facultyId,
        status: "ACTIVE"
    });

    return assignments.map((a) => a.subject.toString());

};

// ======================================================
// Enforcement helper used by the session engine.
// Given the logged-in user (req.user, from the JWT) and a
// subject ID, verifies the user is allowed to start a session
// for that subject.
//
// - Admins are always allowed (they can schedule for any subject).
// - Faculty must have a Faculty profile linked to their User
//   account (Faculty.user) AND an ACTIVE FacultySubject row for
//   that exact subject.
// ======================================================

const assertFacultyCanAccessSubject = async (user, subjectId) => {

    if (!user) {
        throw new Error("Not authenticated");
    }

    if (user.role === "admin") {
        return true;
    }

    const facultyProfile = await Faculty.findOne({ user: user.id });

    if (!facultyProfile) {
        throw new Error(
            "No faculty profile is linked to your account yet. " +
            "Ask an admin to link your login to a Faculty record."
        );
    }

    const assignedSubjectIds = await getAssignedSubjectIds(
        facultyProfile._id
    );

    if (!assignedSubjectIds.includes(subjectId.toString())) {
        throw new Error(
            "You are not assigned to teach this subject."
        );
    }

    return true;

};

// ======================================================
// Convenience for the logged-in faculty user: resolve their
// Faculty profile (via the User link) and return the subjects
// they're actively assigned to. Used to power a faculty
// dashboard that only shows subjects they're allowed to teach.
// ======================================================

const getMyAssignedSubjects = async (user) => {

    if (!user) {
        throw new Error("Not authenticated");
    }

    const facultyProfile = await Faculty.findOne({ user: user.id });

    if (!facultyProfile) {
        throw new Error(
            "No faculty profile is linked to your account yet. " +
            "Ask an admin to link your login to a Faculty record."
        );
    }

    const assignments = await FacultySubject.find({
        faculty: facultyProfile._id,
        status: "ACTIVE"
    }).populate("subject");

    return {
        faculty: facultyProfile,
        subjects: assignments.map((a) => a.subject)
    };

};

module.exports = {
    assignSubject,
    removeAssignment,
    getAssignments,
    getAssignedSubjectIds,
    getMyAssignedSubjects,
    assertFacultyCanAccessSubject
};
