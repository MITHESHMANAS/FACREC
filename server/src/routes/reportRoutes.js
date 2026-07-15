const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

    generatePDF,

    generateExcel

} = require("../controllers/reportController");

router.get(

    "/pdf",

    protect,

    authorize("admin","faculty","student"),

    generatePDF

);

router.get(

    "/excel",

    protect,

    authorize("admin","faculty"),

    generateExcel

);

module.exports = router;