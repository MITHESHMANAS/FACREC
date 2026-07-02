const AttendanceSession = require("../models/AttendanceSession");

const createSession = async (data) => {

    const session = await AttendanceSession.create(data);

    return session;

};

const getSessions = async () => {

    return await AttendanceSession
        .find()
        .populate("subject");

};

module.exports = {
    createSession,
    getSessions
};