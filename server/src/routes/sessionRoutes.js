const express = require("express");
const router = express.Router();
const controller = require("../controllers/sessionController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Admin only: Create sessions
router.post(
    "/",
    protect,
    authorize("admin"),
    controller.createSession
);

// Both Admin and Faculty: View sessions
router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getSessions
);

// Admin only: Edit/Delete sessions
router.put(
    "/:id",
    protect,
    authorize("admin"),
    controller.updateSession
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    controller.deleteSession
);

// Both Admin and Faculty: Manage lifecycle
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

// UPDATED: Now allows faculty to reopen sessions
router.patch(
    "/:id/reopen",
    protect,
    authorize("admin", "faculty"), 
    controller.reopenSession
);

module.exports = router;