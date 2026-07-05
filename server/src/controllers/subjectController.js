const subjectService = require("../services/subjectService");

const createSubject = async (req, res) => {

    try {

        const subject = await subjectService.createSubject(req.body);

        res.status(201).json({
            success: true,
            subject
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getSubjects = async (req, res) => {

    try {

        const subjects = await subjectService.getSubjects();

        res.json({
            success: true,
            count: subjects.length,
            subjects
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const updateSubject = async (req, res) => {

    try {

        const subject = await subjectService.updateSubject(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            subject
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const deleteSubject = async (req, res) => {

    try {

        await subjectService.deleteSubject(req.params.id);

        res.json({
            success: true,
            message: "Subject Deleted Successfully"
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject
};