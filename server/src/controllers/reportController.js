const reportService = require("../services/reportService");

// These are all "the request doesn't make sense" cases, not server
// failures - a session that doesn't exist, hasn't ended, or has no
// attendance is a 400, not a 500. Matching on the message text isn't
// elegant, but reportService throws plain Error objects (not custom
// error classes) and rewriting that is out of scope for this fix.
const isValidationError = (message) =>
    message.includes("not found") ||
    message.includes("hasn't ended") ||
    message.includes("No attendance") ||
    message.includes("No completed session") ||
    message.includes("No active session");

const generatePDF = async (req, res) => {

    try {

        const report = await reportService.generatePDFReport(
            req.query.sessionId || null
        );

        return res.download(

            report.report.filePath,

            report.report.fileName

        );

    }

    catch (err) {

        return res.status(
            isValidationError(err.message) ? 400 : 500
        ).json({

            success: false,

            message: err.message

        });

    }

};

const generateExcel = async (req, res) => {

    try {

        const report = await reportService.generateExcelReport(
            req.query.sessionId || null
        );

        return res.download(

            report.report.filePath,

            report.report.fileName

        );

    }

    catch (err) {

        return res.status(
            isValidationError(err.message) ? 400 : 500
        ).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {

    generatePDF,

    generateExcel

};
