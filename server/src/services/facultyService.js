const Faculty=require("../models/Faculty");

const createFaculty=async(data)=>{

    return await Faculty.create(data);

}

const getFaculty=async()=>{

    return await Faculty.find();

}

module.exports={
    createFaculty,
    getFaculty
};