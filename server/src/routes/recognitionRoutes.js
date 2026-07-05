const express = require("express");

const router = express.Router();

const {
    startRecognition,
} = require("../controllers/recognitionController");

router.post("/start", startRecognition);

module.exports = router;