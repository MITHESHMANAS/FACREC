const sessionService = require("../services/sessionService");

const createSession = async (req, res) => {

    try {

        const session = await sessionService.createSession(req.body);

        res.status(201).json({
            success: true,
            session
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const getSessions = async (req, res) => {

    try {

        const sessions = await sessionService.getSessions();

        res.json({
            success: true,
            count: sessions.length,
            sessions
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const startSession = async (req, res) => {

    try {

        const session = await sessionService.startSession(req.params.id);

        res.json({
            success: true,
            session
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

const completeSession = async (req, res) => {

    try {

        const session = await sessionService.completeSession(req.params.id);

        res.json({
            success: true,
            session
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    createSession,
    getSessions,
    startSession,
    completeSession
};