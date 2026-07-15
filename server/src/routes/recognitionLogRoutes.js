const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

    getRecognitionLogs,

    getRecentRecognitionLogs,

    deleteRecognitionLog

} = require("../controllers/recognitionLogController");

router.get(

    "/",

    protect,

    authorize("admin", "faculty"),

    getRecognitionLogs

);

router.get(

    "/recent",

    protect,

    authorize("admin", "faculty"),

    getRecentRecognitionLogs

);

router.delete(

    "/:id",

    protect,

    authorize("admin"),

    deleteRecognitionLog

);

module.exports = router;