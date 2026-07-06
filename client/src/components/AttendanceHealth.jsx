import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaArrowUp,
    FaArrowDown
} from "react-icons/fa";

const AttendanceHealth = ({ attendance }) => {

    const percentage = attendance?.percentage || 0;

    let title = "";
    let message = "";
    let advice = "";
    let icon = null;
    let bgColor = "";
    let textColor = "";
    let borderColor = "";

    if (percentage >= 90) {

        title = "Excellent Attendance";

        message =
            "Outstanding attendance record.";

        advice =
            "Keep maintaining this consistency.";

        icon = (
            <FaCheckCircle className="text-6xl text-green-500" />
        );

        bgColor = "bg-green-50";

        textColor = "text-green-600";

        borderColor = "border-green-300";

    }

    else if (percentage >= 75) {

        title = "Good Attendance";

        message =
            "Attendance is above the required minimum.";

        advice =
            "Try to maintain above 90% for excellent performance.";

        icon = (
            <FaExclamationTriangle className="text-6xl text-yellow-500" />
        );

        bgColor = "bg-yellow-50";

        textColor = "text-yellow-600";

        borderColor = "border-yellow-300";

    }

    else {

        title = "Attendance Shortage";

        message =
            "Attendance is below the required minimum.";

        advice =
            "Attend upcoming classes regularly to avoid shortage.";

        icon = (
            <FaTimesCircle className="text-6xl text-red-500" />
        );

        bgColor = "bg-red-50";

        textColor = "text-red-600";

        borderColor = "border-red-300";

    }

    return (

        <div
            className={`rounded-2xl shadow-lg border ${borderColor} ${bgColor} p-6 h-full`}
        >

            <div className="flex justify-between items-center">

                <h2 className="text-2xl font-bold">

                    Attendance Health

                </h2>

                {icon}

            </div>

            <div className="mt-8">

                <h1
                    className={`text-5xl font-bold ${textColor}`}
                >

                    {percentage}%

                </h1>

                <h3
                    className={`text-2xl font-semibold mt-3 ${textColor}`}
                >

                    {title}

                </h3>

                <p className="text-gray-600 mt-4">

                    {message}

                </p>

                <p className="text-gray-500 mt-2">

                    {advice}

                </p>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">

                <div className="bg-white rounded-xl p-4 shadow-sm">

                    <div className="flex items-center gap-2">

                        <FaArrowUp className="text-green-600" />

                        <span className="font-semibold">

                            Present

                        </span>

                    </div>

                    <h2 className="text-3xl font-bold mt-3 text-green-600">

                        {attendance.present}

                    </h2>

                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">

                    <div className="flex items-center gap-2">

                        <FaArrowDown className="text-red-600" />

                        <span className="font-semibold">

                            Absent

                        </span>

                    </div>

                    <h2 className="text-3xl font-bold mt-3 text-red-600">

                        {attendance.absent}

                    </h2>

                </div>

            </div>

            <div className="mt-8">

                <div className="flex justify-between text-sm mb-2">

                    <span>

                        Attendance Progress

                    </span>

                    <span>

                        {percentage}%

                    </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">

                    <div

                        className={`h-4 rounded-full transition-all duration-700 ${
                            percentage >= 90
                                ? "bg-green-500"
                                : percentage >= 75
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}

                        style={{

                            width: `${percentage}%`

                        }}

                    />

                </div>

            </div>

        </div>

    );

};

export default AttendanceHealth;