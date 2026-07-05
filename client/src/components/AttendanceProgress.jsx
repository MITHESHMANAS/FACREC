const AttendanceProgress = ({ attendance }) => {

    const percentage = attendance?.percentage || 0;

    const color =
        percentage >= 75
            ? "bg-green-500"
            : percentage >= 50
            ? "bg-yellow-500"
            : "bg-red-500";

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Attendance Progress

            </h2>

            <div className="w-full bg-gray-200 rounded-full h-6">

                <div

                    className={`${color} h-6 rounded-full transition-all duration-700`}

                    style={{

                        width: `${percentage}%`

                    }}

                />

            </div>

            <div className="flex justify-between mt-4">

                <span>

                    Attendance

                </span>

                <span className="font-bold">

                    {percentage}%

                </span>

            </div>

        </div>

    );

};

export default AttendanceProgress;