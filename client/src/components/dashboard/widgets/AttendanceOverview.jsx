import { useEffect, useState } from "react";
import { FaUserCheck, FaUserTimes, FaPercentage } from "react-icons/fa";
import { BeatLoader } from "react-spinners";
import { getDashboardStats } from "../../../services/dashboardService";

const AttendanceOverview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await getDashboardStats();
                setData(response.stats);
            } catch (err) {
                console.error("Failed to load attendance overview summary", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 h-[326px] flex items-center justify-center">
                <BeatLoader color="#4f46e5" />
            </div>
        );
    }

    // Default fallbacks matching the parent application schema structure
    const totalPercentage = data?.attendancePercentage ?? 0;
    const presentCount = data?.presentToday ?? 0;
    const absentCount = data?.absentToday ?? 0;

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 h-full flex flex-col justify-between min-h-[326px]">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">
                    Attendance Overview
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                    Real-time check-in stats
                </p>
            </div>

            {/* Metrics List Stack */}
            <div className="flex flex-col gap-3 my-auto pt-4">
                
                {/* Metric Item: Rate */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm shrink-0">
                            <FaPercentage />
                        </div>
                        <span className="text-sm font-semibold text-slate-600 truncate">
                            Attendance Rate
                        </span>
                    </div>
                    <span className="text-base font-bold text-indigo-600 shrink-0">
                        {totalPercentage}%
                    </span>
                </div>

                {/* Metric Item: Present */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                            <FaUserCheck />
                        </div>
                        <span className="text-sm font-semibold text-slate-600 truncate">
                            Present Students
                        </span>
                    </div>
                    <span className="text-base font-bold text-emerald-600 shrink-0">
                        {presentCount}
                    </span>
                </div>

                {/* Metric Item: Absent */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm shrink-0">
                            <FaUserTimes />
                        </div>
                        <span className="text-sm font-semibold text-slate-600 truncate">
                            Absent Students
                        </span>
                    </div>
                    <span className="text-base font-bold text-amber-600 shrink-0">
                        {absentCount}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default AttendanceOverview;