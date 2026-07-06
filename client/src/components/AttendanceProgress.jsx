import {
    CircularProgressbar,
    buildStyles
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import {
    FaClipboardCheck,
    FaChartLine,
    FaAward
} from "react-icons/fa";

const AttendanceProgress = ({ attendance }) => {

    const percentage = attendance?.percentage || 0;

    let color = "#ef4444";
    let status = "Needs Improvement";
    let message = "Attendance is below the required threshold.";

    if (percentage >= 90) {

        color = "#22c55e";

        status = "Excellent";

        message =
            "Outstanding attendance record. Keep it up!";

    }

    else if (percentage >= 75) {

        color = "#f59e0b";

        status = "Good";

        message =
            "Attendance is satisfactory. Aim for 90%+.";

    }

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-8">

                Attendance Progress

            </h2>

            <div className="grid lg:grid-cols-2 gap-8 items-center">

                <div className="w-56 h-56 mx-auto">

                    <CircularProgressbar

                        value={percentage}

                        text={`${percentage}%`}

                        styles={buildStyles({

                            textColor: color,

                            pathColor: color,

                            trailColor: "#e5e7eb",

                            textSize: "16px"

                        })}

                    />

                </div>

                <div>

                    <div className="flex items-center gap-3 mb-5">

                        <FaAward
                            className="text-3xl"
                            style={{ color }}
                        />

                        <div>

                            <h2
                                className="text-2xl font-bold"
                                style={{ color }}
                            >

                                {status}

                            </h2>

                            <p className="text-gray-500">

                                {message}

                            </p>

                        </div>

                    </div>

                    <div className="space-y-4">

                        <div className="flex justify-between bg-slate-100 rounded-xl p-4">

                            <div className="flex gap-3 items-center">

                                <FaClipboardCheck className="text-green-600"/>

                                <span>

                                    Present

                                </span>

                            </div>

                            <strong>

                                {attendance.present}

                            </strong>

                        </div>

                        <div className="flex justify-between bg-slate-100 rounded-xl p-4">

                            <div className="flex gap-3 items-center">

                                <FaChartLine className="text-red-500"/>

                                <span>

                                    Absent

                                </span>

                            </div>

                            <strong>

                                {attendance.absent}

                            </strong>

                        </div>

                        <div className="flex justify-between bg-slate-100 rounded-xl p-4">

                            <span>

                                Total Classes

                            </span>

                            <strong>

                                {attendance.total}

                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default AttendanceProgress;