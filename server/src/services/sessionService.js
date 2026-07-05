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

    // End any currently active sessions
    await AttendanceSession.updateMany(
        {
            status: "ACTIVE"
        },
        {
            status: "ENDED",
            endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
    );

    // Start selected session
    const session = await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ACTIVE",
            startTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            }),
            endTime: null
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

    if (!session) {
        throw new Error("Session not found");
    }

    return session;

};

const completeSession = async (id) => {

    const session = await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ENDED",
            endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

    if (!session) {
        throw new Error("Session not found");
    }

    return session;

};

module.exports = {
    createSession,
    getSessions,
    updateSession,
    deleteSession,
    startSession,
    completeSession
};