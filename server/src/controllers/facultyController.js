const facultyService=require("../services/facultyService");

const createFaculty=async(req,res)=>{

    try{

        const faculty=await facultyService.createFaculty(req.body);

        res.status(201).json({
            success:true,
            faculty
        });

    }

    catch(err){

        res.status(400).json({
            success:false,
            message:err.message
        });

    }

}

const getFaculty=async(req,res)=>{

    const faculty=await facultyService.getFaculty();

    res.json({
        success:true,
        count:faculty.length,
        faculty
    });

}

module.exports={
    createFaculty,
    getFaculty
};