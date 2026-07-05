const AttendanceSession = require("../models/AttendanceSession");

const createSession = async (data) => {

    return await AttendanceSession.create(data);

};

const getSessions = async () => {

    return await AttendanceSession.find().populate("subject");

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
    startSession,
    completeSession
};