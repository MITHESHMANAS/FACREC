const enrollmentService = require("../services/enrollmentService");

const getEnrollments = async (req, res) => {

    try {

        const enrollments = await enrollmentService.getEnrollments({
            subject: req.query.subject,
            student: req.query.student
        });

        res.json({
            success: true,
            count: enrollments.length,
            enrollments
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const enrollStudent = async (req, res) => {

    try {

        const enrollment = await enrollmentService.enrollStudent(req.body);

        res.status(201).json({
            success: true,
            enrollment
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const removeEnrollment = async (req, res) => {

    try {

        const enrollment = await enrollmentService.removeEnrollment(
            req.params.id
        );

        res.json({
            success: true,
            enrollment
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    getEnrollments,
    enrollStudent,
    removeEnrollment
};
