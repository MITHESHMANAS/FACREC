const sessionService = require("../services/sessionService");

const createSession = async (req, res) => {

    try {

        const session = await sessionService.createSession(req.body);

        res.status(201).json({
            success: true,
            session
        });

    }

    catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getSessions = async (req, res) => {

    const sessions = await sessionService.getSessions();

    res.json({
        success: true,
        count: sessions.length,
        sessions
    });

};

module.exports = {
    createSession,
    getSessions
};