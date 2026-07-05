const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/facultyController");

router.post(
    "/",
    protect,
    authorize("admin"),
    controller.createFaculty
);

router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    controller.getFaculty
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    controller.updateFaculty
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    controller.deleteFaculty
);

module.exports = router;