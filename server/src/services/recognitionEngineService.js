const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const startRecognition = () => {

    return new Promise((resolve, reject) => {

        const pythonScript = path.join(
            __dirname,
            "../../../face_recognition.py"
        );

        if (!fs.existsSync(pythonScript)) {

            return reject(
                new Error(`Python file not found: ${pythonScript}`)
            );

        }

        const pythonExecutable = process.env.PYTHON_PATH || "python";

        const python = spawn(
            pythonExecutable,
            [pythonScript]
        );

        let output = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {

            output += data.toString();

        });

        python.stderr.on("data", (data) => {

            errorOutput += data.toString();

        });

        python.on("error", (err) => {

            reject(err);

        });

        python.on("close", (code) => {

            if (code !== 0) {

                return reject(
                    new Error(
                        errorOutput || `Python exited with code ${code}`
                    )
                );

            }

            output = output.trim();

            if (!output) {

                return resolve({

                    success: false,

                    recognized: [],

                    total: 0,

                    message: "Python returned no output."

                });

            }

            try {

                const result = JSON.parse(output);

                return resolve(result);

            }

            catch (err) {

                console.error("Invalid JSON from Python:");
                console.error(output);

                return resolve({

                    success: false,

                    recognized: [],

                    total: 0,

                    message: "Python returned invalid JSON.",

                    rawOutput: output

                });

            }

        });

    });

};

module.exports = {

    startRecognition

};