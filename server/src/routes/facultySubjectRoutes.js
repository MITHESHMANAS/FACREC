const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/facultySubjectController");

router.post(
    "/",
    protect,
    authorize("admin"),
    controller.assignSubject
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getAssignments
);

router.get(
    "/mine",
    protect,
    authorize("admin", "faculty"),
    controller.getMyAssignedSubjects
);

router.patch(
    "/:id/remove",
    protect,
    authorize("admin"),
    controller.removeAssignment
);

module.exports = router;
