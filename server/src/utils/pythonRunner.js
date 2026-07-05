const { spawn } = require("child_process");
const path = require("path");

const runPython = () => {

    return new Promise((resolve, reject) => {

        const pythonFile = path.join(
            __dirname,
            "../../../vision/app.py"
        );

        const python = spawn("python", [pythonFile]);

        let output = "";
        let error = "";

        python.stdout.on("data", (data) => {
            output += data.toString();
        });

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("close", (code) => {

            if (code !== 0) {
                return reject(
                    new Error(error || "Python process failed")
                );
            }

            try {

                // Keep only non-empty lines
                const lines = output
                    .split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(Boolean);

                // Find the last line that looks like JSON
                const jsonLine = [...lines]
                    .reverse()
                    .find(line =>
                        line.startsWith("{") &&
                        line.endsWith("}")
                    );

                if (!jsonLine) {
                    throw new Error("No JSON found");
                }

                resolve(JSON.parse(jsonLine));

            }

            catch (err) {

                console.error("Python Output:");
                console.error(output);

                reject(
                    new Error(
                        "Invalid JSON returned by Python"
                    )
                );

            }

        });

    });

};

module.exports = runPython;