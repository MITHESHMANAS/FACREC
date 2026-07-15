import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AppLayout from "../layouts/AppLayout";
import CardSkeleton from "../components/ui/CardSkeleton";

import AdminWidgets from "../components/dashboard/AdminWidgets";
import FacultyWidgets from "../components/dashboard/FacultyWidgets";
import StudentWidgets from "../components/dashboard/StudentWidgets";

import QuickActions from "../components/dashboard/widgets/QuickActions";
import AttendanceTrendChart from "../components/dashboard/widgets/AttendanceTrendChart";

import useAttendanceSocket from "../hooks/useAttendanceSocket";
import socket from "../socket/socket";
import { getDashboardStats } from "../services/dashboardService";
import { getEngineStatus } from "../services/recognitionService";
import { getAnalytics } from "../services/analyticsService";
import { useAuth } from "../context/AuthContext";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
};

const ROLE_LABEL = {
    admin: "Administrator",
    faculty: "Faculty Member",
    student: "Student"
};

const Dashboard = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        subjects: 0,
        attendancePercentage: 0
    });

    const [loading, setLoading] = useState(true);
    const [socketConnected, setSocketConnected] = useState(socket.connected);
    const [apiReachable, setApiReachable] = useState(true);
    const [engine, setEngine] = useState(null);
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        const handleConnect = () => setSocketConnected(true);
        const handleDisconnect = () => setSocketConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data.stats);
            setApiReachable(true);
        } catch (err) {
            console.error(err);
            toast.error("Unable to load dashboard");
            setApiReachable(false);
        } finally {
            setLoading(false);
        }
    };

    const loadEngineStatus = async () => {
        try {
            const data = await getEngineStatus();
            setEngine(data);
        } catch {
            setEngine(null);
        }
    };

    const loadInsights = async () => {
        try {
            const data = await getAnalytics();
            setInsights(data);
        } catch {
            setInsights(null);
        }
    };

    useEffect(() => {
        loadDashboard();
        loadEngineStatus();

        if (user?.role === "admin") {
            loadInsights();
        }
    }, [user?.role]);

    useAttendanceSocket(() => {
        loadDashboard();
    }, () => {
        loadDashboard();
    });

    return (
        <AppLayout>
            {/* Strict 24px vertical rhythm row compression */}
            <div className="flex flex-col gap-6">
                
                {/* Compact Hero Banner: Height constrained to 110px-120px zone */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-5 min-h-[115px] flex items-center shadow-sm border border-slate-800">
                    {/* Softened decorative accent */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

                    <div className="relative flex items-center justify-between gap-6 w-full">
                        {/* High-density typography layout stack */}
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 leading-none">
                                {getGreeting()}
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
                                Welcome back, {user?.name || "there"}
                            </h1>
                            <p className="text-slate-400 text-xs font-medium">
                                {ROLE_LABEL[user?.role] || "User"} &middot; Attendance Management Platform
                            </p>
                        </div>

                        {/* Tighter, vertically balanced right panel alignment */}
                        <div className="flex items-center gap-6 shrink-0">
                            <div className="text-right space-y-0.5">
                                <p className="text-xs font-semibold text-slate-200">
                                    {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit" })}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Academic Year 2026
                                </p>
                            </div>

                            {/* Clean mini indicator element */}
                            <span
                                className={
                                    `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur ` +
                                    (socketConnected
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-white/5 text-slate-400 border-white/10")
                                }
                            >
                                <span
                                    className={
                                        `w-1.5 h-1.5 rounded-full ` +
                                        (socketConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500")
                                    }
                                />
                                {socketConnected ? "LIVE" : "OFFLINE"}
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <CardSkeleton cards={4} />
                ) : (
                    <>
                        {/* Role Based Statistics (KPI cards automatically nested inside) */}
                        {user?.role === "admin" && <AdminWidgets stats={stats} />}
                        {user?.role === "faculty" && <FacultyWidgets stats={stats} />}
                        {user?.role === "student" && <StudentWidgets stats={stats} />}

                        {/* Quick Actions */}
                        <QuickActions />

                        {/* Today's Insights Section - Compact Typography Scale */}
                        {user?.role === "admin" && insights && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                                    Today's Insights
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Attendance Mini Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between min-h-[105px]">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance</p>
                                        <p className="text-3xl font-bold tracking-tight text-slate-800 leading-none">
                                            {(insights.present + insights.absent) > 0
                                                ? `${Math.round((insights.present / (insights.present + insights.absent)) * 100)}%`
                                                : "—"}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Across ended sessions
                                        </p>
                                    </div>

                                    {/* Accuracy Mini Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between min-h-[105px]">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recognition Accuracy</p>
                                        <p className="text-3xl font-bold tracking-tight text-slate-800 leading-none">
                                            {insights.recognitionStats.accuracy}%
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Based on recent scans
                                        </p>
                                    </div>

                                    {/* Shortage Mini Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between min-h-[105px]">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students Below 75%</p>
                                        <p className="text-3xl font-bold tracking-tight text-slate-800 leading-none">
                                            {insights.shortageStudents.length}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {insights.shortageStudents.length > 0 ? "Review required" : "All students on track"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trend Chart Content Wrapper */}
                        <div>
                            <AttendanceTrendChart />
                        </div>

                        {/* System Health Section Container */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                        System Health
                                    </h2>
                                    <p className="text-slate-400 text-xs font-medium">
                                        {socketConnected
                                            ? "All background tracking submodules connected successfully."
                                            : "Realtime pipeline detached. Reload browser context."}
                                    </p>
                                </div>

                                <span
                                    className={
                                        `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ` +
                                        (socketConnected
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-red-50 text-red-500")
                                    }
                                >
                                    <span
                                        className={
                                            `w-1.5 h-1.5 rounded-full ` +
                                            (socketConnected ? "bg-emerald-500 animate-pulse" : "bg-red-400")
                                        }
                                    />
                                    {socketConnected ? "Online" : "Disconnected"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                {[
                                    { label: "Backend Core", ok: apiReachable },
                                    { label: "MongoDB Node", ok: apiReachable },
                                    { label: "Socket Engine", ok: socketConnected },
                                    { label: "Vision Cascade", ok: engine?.visionModule === "READY" }
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.ok ? "bg-emerald-500" : "bg-red-400"}`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{s.label}</p>
                                            <p className="text-[11px] text-slate-400">{s.ok ? "Operational" : "Offline"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default Dashboard;