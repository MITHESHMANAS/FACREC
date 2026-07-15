import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import { BeatLoader } from "react-spinners";

import { getAttendanceTrend } from "../../../services/dashboardAnalyticsService";
import EmptyState from "../../ui/EmptyState";
import { FaChartLine } from "react-icons/fa";

const AttendanceTrendChart = () => {
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTrend = async () => {
        try {
            const data = await getAttendanceTrend();
            setTrend(data.trend || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrend();
    }, []);

    const values = trend.map(t => t.attendance);
    const average = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
    const peak = values.length ? Math.max(...values) : 0;
    const lowest = values.length ? Math.min(...values) : 0;

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 pb-4">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Attendance Trend
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Last 7 days
                    </p>
                </div>

                {!loading && trend.length > 0 && (
                    <div className="flex items-center gap-3">
                        {/* Average Chip */}
                        <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[74px]">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Average
                            </p>
                            <p className="text-base font-bold text-indigo-600">
                                {average}%
                            </p>
                        </div>
                        
                        {/* Peak Chip */}
                        <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[74px]">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Peak
                            </p>
                            <p className="text-base font-bold text-emerald-600">
                                {peak}%
                            </p>
                        </div>

                        {/* Lowest Chip */}
                        <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[74px]">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Lowest
                            </p>
                            <p className="text-base font-bold text-amber-600">
                                {lowest}%
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <BeatLoader color="#4f46e5" />
                </div>
            ) : trend.length === 0 ? (
                <EmptyState
                    icon={FaChartLine}
                    title="No attendance data yet"
                    message="Once sessions are marked, the weekly trend will appear here."
                />
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                        <CartesianGrid 
                            stroke="#e2e8f0" 
                            strokeDasharray="4 4" 
                            vertical={false} 
                        />
                        <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            dy={8}
                        />
                        <YAxis 
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            dx={-8}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 16,
                                border: "1px solid #e2e8f0",
                                padding: "10px 14px",
                                boxShadow: "0 10px 25px rgba(15,23,42,0.10)",
                                background: "#fff"
                            }}
                            labelStyle={{ fontWeight: 600, color: "#1e293b" }}
                            cursor={{
                                stroke: "#6366f1",
                                strokeWidth: 1,
                                strokeDasharray: "4 4"
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#4f46e5"
                            strokeWidth={4}
                            dot={{
                                r: 4,
                                strokeWidth: 2,
                                fill: "#ffffff"
                            }}
                            activeDot={{
                                r: 6
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default AttendanceTrendChart;