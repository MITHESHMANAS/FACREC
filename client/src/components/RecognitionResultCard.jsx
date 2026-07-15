import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { FaUserGraduate, FaUserSlash } from "react-icons/fa";

import Badge from "./Badge";

const RecognitionResultCard = ({ log, index = 0 }) => {

    const matched = log.status === "RECOGNIZED";
    const hex = matched ? "#10b981" : "#94a3b8";

    return (

        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            className={
                `flex items-center gap-4 rounded-xl border p-4 ` +
                (matched
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-slate-50/50")
            }
        >

            <div className="w-14 h-14 shrink-0">
                <CircularProgressbar
                    value={log.confidence || 0}
                    text={`${log.confidence ?? 0}%`}
                    strokeWidth={9}
                    styles={buildStyles({
                        textColor: hex,
                        pathColor: hex,
                        trailColor: "#e2e8f0",
                        textSize: "26px"
                    })}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {
                        matched
                            ? <FaUserGraduate className="text-emerald-600 shrink-0" />
                            : <FaUserSlash className="text-slate-400 shrink-0" />
                    }
                    <h3 className="font-semibold text-slate-800 truncate">
                        {log.name}
                    </h3>
                </div>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                    {log.subject || "—"}
                </p>
            </div>

            <Badge status={log.status} />

        </motion.div>

    );

};

export default RecognitionResultCard;
