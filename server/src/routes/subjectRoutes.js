const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/subjectController");

router.post(
    "/",
    protect,
    authorize("admin"),
    controller.createSubject
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getSubjects
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    controller.updateSubject
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    controller.deleteSubject
);

module.exports = router;