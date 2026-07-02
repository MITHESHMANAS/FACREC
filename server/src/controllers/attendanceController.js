const attendanceService=require("../services/attendanceService");

const markAttendance=async(req,res)=>{

    try{

        const attendance=await attendanceService.markAttendance(req.body);

        res.status(201).json({
            success:true,
            attendance
        });

    }

    catch(err){

        res.status(400).json({
            success:false,
            message:err.message
        });

    }

};

const getAttendance=async(req,res)=>{

    const attendance=await attendanceService.getAttendance();

    res.json({
        success:true,
        count:attendance.length,
        attendance
    });

};

module.exports={
    markAttendance,
    getAttendance
};