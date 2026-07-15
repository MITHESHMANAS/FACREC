const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const RecognitionLog = require("../models/RecognitionLog");
const enrollmentService = require("./enrollmentService");

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

    // face_dataset/<roll_no>.npy is how the vision layer keys a
    // registered face (see register_student.py / face_recognition.py).
    // Default faceDatasetId to rollNo automatically so recognition
    // works the moment a face is captured, without a separate manual
    // "link the dataset ID" step that's easy to forget and leaves
    // faceDatasetId stuck at null.
    const payload = {
        ...data,
        faceDatasetId: data.faceDatasetId || data.rollNo
    };

    const student = await Student.create(payload);

    // Auto enroll the student into every subject that matches
    // their branch + semester (no manual enrollment screen needed)
    try {
        await enrollmentService.autoEnrollStudent(student);
    } catch (err) {
        console.log("Auto-enrollment failed:", err.message);
    }

    return student;
};

const getStudents = async () => {

    return await Student.find().sort({
        createdAt: -1
    });

};
const getStudentById = async (id) => {

    const student = await Student.findById(id);

    if (!student) {
        throw new Error("Student not found");
    }

    return student;
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

    return student;
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

    return student;
};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};