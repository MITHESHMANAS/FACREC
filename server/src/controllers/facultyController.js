const facultyService = require("../services/facultyService");

const createFaculty = async (req, res) => {

    try {

        const faculty = await facultyService.createFaculty(req.body);

        res.status(201).json({
            success: true,
            faculty
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getFaculty = async (req, res) => {

    try {

        const faculty = await facultyService.getFaculty();

        res.json({
            success: true,
            count: faculty.length,
            faculty
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const updateFaculty = async (req, res) => {

    try {

        const faculty = await facultyService.updateFaculty(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            faculty
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const deleteFaculty = async (req, res) => {

    try {

        await facultyService.deleteFaculty(req.params.id);

        res.json({
            success: true,
            message: "Faculty Deleted Successfully"
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    createFaculty,
    getFaculty,
    updateFaculty,
    deleteFaculty
};