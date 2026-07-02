const Student = require("../models/Student");

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

    return await Student.create(data);
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

    return student;
};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};