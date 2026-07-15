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

        let settled = false;

        // face_recognition.py caps itself at MAX_FRAMES under normal
        // operation, but a camera that fails to open can block
        // cv2.VideoCapture/cap.read() indefinitely on some drivers -
        // in that case the child process never exits and the request
        // would otherwise hang forever. Kill it and fail loud instead.
        const timeout = setTimeout(() => {

            if (settled) return;

            settled = true;

            python.kill("SIGKILL");

            reject(
                new Error(
                    "Recognition timed out after 45 seconds. Check " +
                    "the camera connection and try again."
                )
            );

        }, 45000);

        let output = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {

            output += data.toString();

        });

        python.stderr.on("data", (data) => {

            errorOutput += data.toString();

        });

        python.on("error", (err) => {

            if (settled) return;
            settled = true;

            clearTimeout(timeout);

            reject(err);

        });

        python.on("close", (code) => {

            if (settled) return;
            settled = true;

            clearTimeout(timeout);

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