const Subject = require("../models/Subject");

const createSubject = async (data) => {

    return await Subject.create(data);

};

const getSubjects = async () => {

    return await Subject.find();

};

const updateSubject = async (id, data) => {

    return await Subject.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};

const deleteSubject = async (id) => {

    return await Subject.findByIdAndDelete(id);

};

module.exports = {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject
};