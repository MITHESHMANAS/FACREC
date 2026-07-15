import { getTier } from "../utils/attendanceTier";
import Card from "./ui/Card";

const AttendanceHealth = ({ attendance }) => {

    const percentage = attendance?.percentage || 0;
    const tier = getTier(percentage);

    return (

        <Card className="h-full">

            <div className="flex justify-between items-start">

                <h2 className="text-sm font-medium text-gray-500">

                    Attendance Health

                </h2>

                <span
                    className={
                        `px-3 py-1 rounded-full text-xs font-semibold ` +
                        `whitespace-nowrap ${tier.badge}`
                    }
                >

                    {tier.title}

                </span>

            </div>

            <h1 className="text-4xl font-bold mt-2 text-slate-800">

                {percentage}%

            </h1>

            <p className="text-gray-500 text-sm mt-2">

                {tier.advice}

            </p>

            <div className="mt-6">

                <div className="flex justify-between text-xs text-gray-500 mb-2">

                    <span>Attendance Progress</span>

                    <span>{percentage}%</span>

                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5">

                    <div

                        className={`h-2.5 rounded-full transition-all duration-700 ${tier.bar}`}

                        style={{

                            width: `${percentage}%`

                        }}

                    />

                </div>

            </div>

        </Card>

    );

};

export default AttendanceHealth;
