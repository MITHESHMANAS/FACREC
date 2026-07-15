const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

    startRecognition,

    healthCheck

} = require("../controllers/recognitionEngineController");

router.get(

    "/health",

    protect,

    authorize("admin","faculty"),

    healthCheck

);

router.post(

    "/start",

    protect,

    authorize("admin","faculty"),

    startRecognition

);

module.exports = router;