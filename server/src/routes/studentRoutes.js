const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/studentController");

router.post(
    "/",
    protect,
    authorize("admin"),
    controller.createStudent
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getStudents
);

router.get(
    "/:id",
    protect,
    authorize("admin", "faculty"),
    controller.getStudentById
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    controller.updateStudent
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    controller.deleteStudent
);

module.exports = router;