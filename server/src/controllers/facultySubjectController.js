const facultySubjectService = require("../services/facultySubjectService");

const assignSubject = async (req, res) => {

    try {

        const assignment = await facultySubjectService.assignSubject(
            req.body
        );

        res.status(201).json({
            success: true,
            assignment
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getAssignments = async (req, res) => {

    try {

        const assignments = await facultySubjectService.getAssignments({
            faculty: req.query.faculty,
            subject: req.query.subject
        });

        res.json({
            success: true,
            count: assignments.length,
            assignments
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const removeAssignment = async (req, res) => {

    try {

        const assignment = await facultySubjectService.removeAssignment(
            req.params.id
        );

        res.json({
            success: true,
            assignment
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getMyAssignedSubjects = async (req, res) => {

    try {

        const result = await facultySubjectService.getMyAssignedSubjects(
            req.user
        );

        res.json({
            success: true,
            faculty: result.faculty,
            count: result.subjects.length,
            subjects: result.subjects
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    assignSubject,
    getAssignments,
    removeAssignment,
    getMyAssignedSubjects
};
