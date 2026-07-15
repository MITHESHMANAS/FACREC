import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { FaUser } from "react-icons/fa";

import { getRecentRecognition } from "../../../services/dashboardAnalyticsService";

const confidenceColor = (pct) => {

    if (pct >= 75) return "text-emerald-700 bg-emerald-100";
    if (pct >= 50) return "text-amber-700 bg-amber-100";

    return "text-red-700 bg-red-100";

};

const RecentRecognitionWidget = () => {

    const [logs, setLogs] = useState([]);

    const [loading, setLoading] = useState(true);

    const loadRecentRecognition = async () => {

        try {

            const data = await getRecentRecognition();

            setLogs(data.logs);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadRecentRecognition();

    }, []);

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-lg font-semibold text-slate-800">
                    Recent Recognition
                </h2>

                <span className="text-xs text-gray-400 font-medium">
                    Last 10 Records
                </span>

            </div>

            {

                loading ?

                (

                    <div className="flex justify-center py-10">

                        <BeatLoader
                            color="#4f46e5"
                            size={10}
                        />

                    </div>

                )

                :

                logs.length === 0 ?

                (

                    <div className="text-center py-10">

                        <p className="text-gray-500">

                            No recognition records found.

                        </p>

                    </div>

                )

                :

                (

                    <div className="space-y-1">

                        {

                            logs.map((log) => {

                                const name = log.student
                                    ? log.student.name
                                    : log.recognizedName;

                                return (

                                    <div

                                        key={log._id}

                                        className="flex items-center gap-3 py-4 px-1 border-b border-slate-50 last:border-0"

                                    >

                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs font-semibold shrink-0">
                                            {name ? name.charAt(0).toUpperCase() : <FaUser />}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-sm text-slate-700 truncate">
                                                {name || "Unknown"}
                                            </h3>
                                            <p className="text-xs text-gray-400 truncate">
                                                {log.subject}
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0">

                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceColor(log.confidence)}`}>
                                                {log.confidence}%
                                            </span>

                                            <p className="text-[11px] text-gray-400 mt-1">
                                                {
                                                    new Date(
                                                        log.capturedAt
                                                    ).toLocaleTimeString()
                                                }
                                            </p>

                                        </div>

                                    </div>

                                );

                            })

                        }

                    </div>

                )

            }

        </div>

    );

};

export default RecentRecognitionWidget;