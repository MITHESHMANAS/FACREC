const AttendanceSession = require("../models/AttendanceSession");

const createSession = async (data) => {

    const session = await AttendanceSession.create(data);

    return await AttendanceSession.findById(session._id)
        .populate("subject");

};

const getSessions = async () => {

    return await AttendanceSession.find()
        .populate("subject");

};

const updateSession = async (id, data) => {

    return await AttendanceSession.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

};

const deleteSession = async (id) => {

    return await AttendanceSession.findByIdAndDelete(id);

};

const startSession = async (id) => {

    return await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ACTIVE"
        },
        {
            new: true
        }
    ).populate("subject");

};

const completeSession = async (id) => {

    return await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ENDED",
            endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        },
        {
            new: true
        }
    ).populate("subject");

};

module.exports = {
    createSession,
    getSessions,
    updateSession,
    deleteSession,
    startSession,
    completeSession
};