const Faculty = require("../models/Faculty");
const FacultySubject = require("../models/FacultySubject");
const AttendanceSession = require("../models/AttendanceSession");

const createFaculty = async (data) => {

    return await Faculty.create(data);

};

const getFaculty = async () => {

    return await Faculty.find();

};

const updateFaculty = async (id, data) => {

    return await Faculty.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};

const deleteFaculty = async (id) => {

    const faculty = await Faculty.findById(id);

    if (!faculty) {
        throw new Error("Faculty not found");
    }

    const activeAssignments = await FacultySubject.countDocuments({
        faculty: id,
        status: "ACTIVE"
    });

    if (activeAssignments > 0) {

        throw new Error(
            "Cannot delete this faculty member - they still have " +
            "active subject assignments. Remove those first."
        );

    }

    // AttendanceSession.faculty is stored as a display-name string,
    // not an ObjectId reference (see the model), so this matches on
    // name the same way the rest of the schema already does. Not
    // deleting someone with a live session in progress avoids a
    // session that's mid-attendance suddenly referencing nobody.
    const liveSessions = await AttendanceSession.countDocuments({
        faculty: faculty.name,
        status: { $in: ["SCHEDULED", "ACTIVE"] }
    });

    if (liveSessions > 0) {

        throw new Error(
            "Cannot delete this faculty member - they have " +
            "scheduled or active sessions. End or remove those first."
        );

    }

    return await Faculty.findByIdAndDelete(id);

};

// ======================================================
// Link a faculty profile to a login (User) account.
// Required before that faculty member can be enforced
// against Faculty-Subject assignments when starting a session.
// ======================================================

const linkUser = async (id, userId) => {

    const faculty = await Faculty.findByIdAndUpdate(
        id,
        { user: userId },
        { new: true, runValidators: true }
    );

    if (!faculty) {
        throw new Error("Faculty not found");
    }

    return faculty;

};

module.exports = {
    createFaculty,
    getFaculty,
    updateFaculty,
    deleteFaculty,
    linkUser
};