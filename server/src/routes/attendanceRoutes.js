const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/attendanceController");

router.post(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.markAttendance
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getAttendance
);

module.exports = router;