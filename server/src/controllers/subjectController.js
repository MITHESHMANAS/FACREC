const subjectService=require("../services/subjectService");

const createSubject=async(req,res)=>{

    try{

        const subject=await subjectService.createSubject(req.body);

        res.status(201).json({
            success:true,
            subject
        });

    }

    catch(err){

        res.status(400).json({
            success:false,
            message:err.message
        });

    }

}

const getSubjects=async(req,res)=>{

    const subjects=await subjectService.getSubjects();

    res.json({
        success:true,
        count:subjects.length,
        subjects
    });

}

module.exports={
    createSubject,
    getSubjects
}