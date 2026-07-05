const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {

    generatePDF,

    generateExcel

} = require("../controllers/reportController");

router.get(

    "/pdf",

    protect,

    generatePDF

);

router.get(

    "/excel",

    protect,

    generateExcel

);

module.exports = router;