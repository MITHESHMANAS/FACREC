const express = require("express");

const router = express.Router();

const controller = require("../controllers/sessionController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post(
    "/",
    protect,
    authorize("admin"),
    controller.createSession
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getSessions
);

router.patch(
    "/:id/start",
    protect,
    authorize("admin", "faculty"),
    controller.startSession
);

router.patch(
    "/:id/complete",
    protect,
    authorize("admin", "faculty"),
    controller.completeSession
);

module.exports = router;