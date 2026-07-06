const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {

    startRecognition,

    healthCheck

} = require("../controllers/recognitionEngineController");

router.get(
    "/health",
    healthCheck
);

router.post(
    "/start",
    protect,
    startRecognition
);

module.exports = router;