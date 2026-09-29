const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const RecognitionLog = require("../models/RecognitionLog");
const enrollmentService = require("./enrollmentService");
const {
    withFaceStatus,
    deleteFaceDataset
} = require("../utils/faceDataset");

const createStudent = async (data) => {

    const existing = await Student.findOne({
        $or: [
            { rollNo: data.rollNo },
            { email: data.email }
        ]
    });

    if (existing) {
        throw new Error("Student already exists");
    }

    // Creating a student does NOT register a face. faceDatasetId stays
    // empty here; whether a face exists is decided by the presence of
    // face_dataset/<rollNo>.npy (see utils/faceDataset.js). Recognition
    // already falls back to rollNo, so no manual linking step is needed.
    const { faceDatasetId, ...payload } = data;

    const student = await Student.create(payload);

    // Auto enroll the student into every subject that matches
    // their branch + semester (no manual enrollment screen needed)
    try {
        await enrollmentService.autoEnrollStudent(student);
    } catch (err) {
        console.log("Auto-enrollment failed:", err.message);
    }

    return withFaceStatus(student);
};

const getStudents = async () => {

    const students = await Student.find().sort({
        createdAt: -1
    });

    return students.map(withFaceStatus);

};
const getStudentById = async (id) => {

    const student = await Student.findById(id);

    if (!student) {
        throw new Error("Student not found");
    }

    return withFaceStatus(student);
};

const updateStudent = async (id, data) => {

    const student = await Student.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

    if (!student) {
        throw new Error("Student not found");
    }

    return withFaceStatus(student);
};

const deleteStudent = async (id) => {

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
        throw new Error("Student not found");
    }

    // Hard-deleting a student without cleaning up dependent records
    // leaves Enrollment/Attendance/RecognitionLog documents pointing
    // at a student ObjectId that no longer resolves - they'd render
    // as blank rows everywhere those get populated. Clean up
    // everything that only makes sense in the context of a student
    // who still exists.
    await Promise.all([
        Enrollment.deleteMany({ student: id }),
        Attendance.deleteMany({ student: id }),
        RecognitionLog.deleteMany({ student: id })
    ]);

    // Remove the stored face data as well
    deleteFaceDataset(student);

    return student;
};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};