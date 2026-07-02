const express=require("express");

const router=express.Router();

const protect=require("../middleware/authMiddleware");

const controller=require("../controllers/facultyController");

router.post("/",protect,controller.createFaculty);

router.get("/",protect,controller.getFaculty);

module.exports=router;