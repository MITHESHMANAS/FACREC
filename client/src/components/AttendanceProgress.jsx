import {
    CircularProgressbar,
    buildStyles
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import { getTier, getTierHex } from "../utils/attendanceTier";
import Card from "./ui/Card";

const AttendanceProgress = ({ attendance }) => {

    const percentage = attendance?.percentage || 0;
    const tier = getTier(percentage);
    const hex = getTierHex(percentage);

    return (

        <Card className="h-full flex flex-col items-center justify-center text-center">

            <div className="w-32 h-32">

                <CircularProgressbar

                    value={percentage}

                    text={`${percentage}%`}

                    strokeWidth={8}

                    styles={buildStyles({

                        textColor: hex,

                        pathColor: hex,

                        trailColor: "#e2e8f0",

                        textSize: "20px"

                    })}

                />

            </div>

            <p className="mt-4 text-sm font-medium text-gray-500">

                Overall Attendance

            </p>

            <p className={`text-sm font-semibold ${tier.text}`}>

                {tier.title}

            </p>

        </Card>

    );

};

export default AttendanceProgress;
