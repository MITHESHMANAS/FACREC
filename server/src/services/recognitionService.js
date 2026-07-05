const runPython = require("../utils/pythonRunner");

const startRecognition = async () => {

    const result = await runPython();

    return result;

};

module.exports = {
    startRecognition
};