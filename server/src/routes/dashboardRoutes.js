const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/dashboardController");

router.get(
    "/stats",
    protect,
    authorize("admin", "faculty"),
    controller.getDashboardStats
);

module.exports = router;