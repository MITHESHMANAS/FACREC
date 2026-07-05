const Faculty = require("../models/Faculty");

const createFaculty = async (data) => {

    return await Faculty.create(data);

};

const getFaculty = async () => {

    return await Faculty.find();

};

const updateFaculty = async (id, data) => {

    return await Faculty.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};

const deleteFaculty = async (id) => {

    return await Faculty.findByIdAndDelete(id);

};

module.exports = {
    createFaculty,
    getFaculty,
    updateFaculty,
    deleteFaculty
};