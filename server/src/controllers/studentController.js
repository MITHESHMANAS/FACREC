const studentService = require("../services/studentService");

const createStudent = async (req, res) => {

    try {

        const student = await studentService.createStudent(req.body);

        res.status(201).json({
            success: true,
            student
        });

    }

    catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const getStudents = async (req, res) => {

    try {

        const students = await studentService.getStudents();

        res.json({
            success: true,
            count: students.length,
            students
        });

    }

    catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
const getStudentById = async (req, res) => {

    try {

        const student = await studentService.getStudentById(req.params.id);

        res.json({
            success: true,
            student
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

const updateStudent = async (req, res) => {

    try {

        const student = await studentService.updateStudent(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            student
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const deleteStudent = async (req, res) => {

    try {

        await studentService.deleteStudent(req.params.id);

        res.json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};