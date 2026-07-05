const analyticsService = require("../services/analyticsService");

const getAnalytics = async (req, res) => {

    try {

        const analytics = await analyticsService.getAnalytics();

        res.json(analytics);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {
    getAnalytics
};