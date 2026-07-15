const dashboardAnalyticsService = require(
    "../services/dashboardAnalyticsService"
);

// ==========================================
// Recent Recognition
// ==========================================

const getRecentRecognition = async (req, res) => {

    try {

        const logs = await dashboardAnalyticsService.getRecentRecognition();

        res.status(200).json({

            success: true,

            count: logs.length,

            logs

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ==========================================
// Active Session
// ==========================================

const getActiveSession = async (req, res) => {

    try {

        const session = await dashboardAnalyticsService.getActiveSession();

        res.status(200).json({

            success: true,

            session

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ==========================================
// Top Performers
// ==========================================

const getTopPerformers = async (req, res) => {

    try {

        const students = await dashboardAnalyticsService.getTopPerformers();

        res.status(200).json({

            success: true,

            count: students.length,

            students

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
const getAttendanceTrend = async (req, res) => {

    try {

        const trend = await dashboardAnalyticsService.getAttendanceTrend();

        res.json({

            success: true,

            trend

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {

    getRecentRecognition,

    getActiveSession,

    getTopPerformers,

    getAttendanceTrend

};