const recognitionLogService = require(
    "../services/recognitionLogService"
);

const getRecognitionLogs = async (req, res) => {

    try {

        const logs = await recognitionLogService.getLogs();

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

const getRecentRecognitionLogs = async (req, res) => {

    try {

        const logs = await recognitionLogService.getRecentLogs(10);

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

const deleteRecognitionLog = async (req, res) => {

    try {

        await recognitionLogService.deleteLog(

            req.params.id

        );

        res.json({

            success: true,

            message: "Recognition log deleted."

        });

    }

    catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {

    getRecognitionLogs,

    getRecentRecognitionLogs,

    deleteRecognitionLog

};