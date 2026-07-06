const recognitionEngineService = require(
    "../services/recognitionEngineService"
);

const attendanceService = require(
    "../services/attendanceService"
);

const Student = require(
    "../models/Student"
);

const AttendanceSession = require(
    "../models/AttendanceSession"
);

const startRecognition = async (req, res) => {

    const startTime = Date.now();

    try {

        const result =
            await recognitionEngineService.startRecognition();

        // ---------------------------------------------
        // Nothing recognized
        // ---------------------------------------------

        if (
            !result.recognized ||
            result.recognized.length === 0
        ) {

            return res.status(200).json({

                success: true,

                message: "No face recognized.",

                executionTime: `${Date.now()-startTime} ms`,

                timestamp: new Date(),

                recognized: [],

                total: 0

            });

        }

        const attendanceResults = [];

        // ---------------------------------------------
        // Active Session
        // ---------------------------------------------

        const activeSession =
            await AttendanceSession.findOne({

                status: "ACTIVE"

            });

        if (!activeSession) {

            return res.status(400).json({

                success:false,

                message:"No active attendance session."

            });

        }

        // ---------------------------------------------
        // Process each recognized student
        // ---------------------------------------------

        for (const face of result.recognized) {

            const student =
                await Student.findOne({

                    name: face.name

                });

            if (!student) {

                attendanceResults.push({

                    student: face.name,

                    status: "Student Not Found"

                });

                continue;

            }

            try {

                const attendance =
                    await attendanceService.markAttendance({

                        student: student._id,

                        session: activeSession._id,

                        status: "Present"

                    });

                attendanceResults.push({

                    student: student.name,

                    status: "Attendance Marked",

                    attendance

                });

            }

            catch (err) {

                attendanceResults.push({

                    student: student.name,

                    status: err.message

                });

            }

        }

        return res.status(200).json({

            success: true,

            message: "Recognition completed successfully.",

            executionTime: `${Date.now()-startTime} ms`,

            timestamp: new Date(),

            recognized: result.recognized,

            attendance: attendanceResults,

            total: result.total

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success:false,

            message:err.message,

            executionTime:`${Date.now()-startTime} ms`

        });

    }

};

const healthCheck = (req,res)=>{

    res.json({

        success:true,

        service:"FACREC Recognition Engine",

        status:"ONLINE",

        timestamp:new Date()

    });

};

module.exports={

    startRecognition,

    healthCheck

};