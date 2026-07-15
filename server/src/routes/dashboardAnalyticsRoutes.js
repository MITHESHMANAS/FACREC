const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

    getRecentRecognition,

    getActiveSession,

    getTopPerformers,

    getAttendanceTrend

} = require("../controllers/dashboardAnalyticsController");

// ======================================================
// Recent Recognition
// ======================================================

router.get(

    "/recent-recognition",

    protect,

    authorize("admin", "faculty"),

    getRecentRecognition

);

// ======================================================
// Active Session
// ======================================================

router.get(

    "/active-session",

    protect,

    authorize("admin", "faculty"),

    getActiveSession

);

// ======================================================
// Top Performers
// ======================================================

router.get(

    "/top-performers",

    protect,

    authorize("admin", "faculty"),

    getTopPerformers

);

// ======================================================
// Attendance Trend (Last 7 Days)
// ======================================================

router.get(

    "/attendance-trend",

    protect,

    authorize("admin", "faculty"),

    getAttendanceTrend

);

module.exports = router;