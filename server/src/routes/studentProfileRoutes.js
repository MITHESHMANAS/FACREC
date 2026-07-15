const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

    getStudentProfile

} = require("../controllers/studentProfileController");

router.get(

    "/:id",

    protect,

    authorize("admin","faculty","student"),

    getStudentProfile

);

module.exports = router;