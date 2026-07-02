const Subject=require("../models/Subject");

const createSubject=async(data)=>{

    const subject=await Subject.create(data);

    return subject;

}

const getSubjects=async()=>{

    return await Subject.find();

}

module.exports={
    createSubject,
    getSubjects
}