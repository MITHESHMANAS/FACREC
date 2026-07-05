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

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    controller.deleteAttendance
);

module.exports = router;