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

module.exports = router;