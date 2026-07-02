const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/sessionController");

router.post(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.createSession
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getSessions
);

module.exports = router;