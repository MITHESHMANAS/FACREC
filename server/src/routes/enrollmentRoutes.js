const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/enrollmentController");

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getEnrollments
);

router.post(
    "/",
    protect,
    authorize("admin"),
    controller.enrollStudent
);

router.patch(
    "/:id/remove",
    protect,
    authorize("admin"),
    controller.removeEnrollment
);

module.exports = router;
