const reportService = require("../services/reportService");

const generatePDF = async (req, res) => {

    try {

        const report = await reportService.generatePDFReport();

        return res.download(

            report.report.filePath,

            report.report.fileName

        );

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

const generateExcel = async (req, res) => {

    try {

        const report = await reportService.generateExcelReport();

        return res.download(

            report.report.filePath,

            report.report.fileName

        );

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {

    generatePDF,

    generateExcel

};