const RecognitionLog = require("../models/RecognitionLog");

const createLog = async (data) => {

    return await RecognitionLog.create(data);

};

const getLogs = async () => {

    return await RecognitionLog.find()

        .populate("student")

        .populate({

            path: "session",

            populate: {

                path: "subject"

            }

        })

        .sort({

            capturedAt: -1

        });

};

const getRecentLogs = async (limit = 10) => {

    return await RecognitionLog.find()

        .populate("student")

        .sort({

            capturedAt: -1

        })

        .limit(limit);

};

const deleteLog = async (id) => {

    return await RecognitionLog.findByIdAndDelete(id);

};

module.exports = {

    createLog,

    getLogs,

    getRecentLogs,

    deleteLog

};