import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CardSkeleton from "../components/ui/CardSkeleton";
import {
    FaUserGraduate,
    FaClipboardCheck,
    FaChartLine,
    FaDatabase,
    FaMicrochip
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import AnalyticsCharts from "../components/AnalyticsCharts";

import { getAnalytics } from "../services/analyticsService";
import { getEngineStatus } from "../services/recognitionService";

const StatusDot = ({ ok, label }) => (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${ok ? "text-emerald-600" : "text-red-500"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
        {label}
    </span>
);

const InfoRow = ({ label, children }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-slate-500 text-sm">{label}</span>
        {children}
    </div>
);

const Analytics = () => {

    const [analytics, setAnalytics] = useState(null);
    const [engineStatus, setEngineStatus] = useState(null);

    const [loading, setLoading] = useState(true);

    const loadAnalytics = async () => {

        try {

            const [analyticsData, statusData] = await Promise.all([
                getAnalytics(),
                getEngineStatus().catch(() => null)
            ]);

            setAnalytics(analyticsData);
            setEngineStatus(statusData);

        }

        catch (err) {

            console.log(err);

            toast.error(
                "Unable to load analytics"
            );

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadAnalytics();

    }, []);

    if (loading) {

        return (

            <AppLayout>

                <div className="mb-6">
                    <div className="h-7 w-56 rounded-full bg-slate-200 animate-pulse mb-2" />
                    <div className="h-4 w-80 rounded-full bg-slate-100 animate-pulse" />
                </div>

                <CardSkeleton cards={4} />

            </AppLayout>

        );

    }

    return (

        <AppLayout>

            <div className="flex justify-between items-center mb-6">

                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Attendance Analytics & Face Recognition Insights
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <KpiCard
                    index={0}
                    title="Attendance %"
                    value={
                        (analytics.present + analytics.absent) > 0
                            ? `${Math.round((analytics.present / (analytics.present + analytics.absent)) * 100)}%`
                            : "—"
                    }
                    icon={FaClipboardCheck}
                    tone="indigo"
                />

                <KpiCard
                    index={1}
                    title="Top Branch"
                    value={
                        analytics.branchAttendance.length > 0
                            ? [...analytics.branchAttendance].sort((a, b) => b.students - a.students)[0]._id
                            : "—"
                    }
                    icon={FaUserGraduate}
                    tone="emerald"
                />

                <KpiCard
                    index={2}
                    title="Shortage Alerts"
                    value={analytics.shortageStudents.length}
                    icon={FaChartLine}
                    tone="red"
                />

                <KpiCard
                    index={3}
                    title="Recognition Accuracy"
                    value={`${analytics.recognitionStats.accuracy}%`}
                    icon={FaMicrochip}
                    tone="amber"
                />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                <Card>
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
                        <FaClipboardCheck className="text-indigo-600" />
                        Attendance Overview
                    </h2>
                    <div className="divide-y divide-slate-100">
                        <InfoRow label="Present">
                            <span className="font-bold text-emerald-600">{analytics.present}</span>
                        </InfoRow>
                        <InfoRow label="Absent">
                            <span className="font-bold text-red-600">{analytics.absent}</span>
                        </InfoRow>
                        <InfoRow label="Active Sessions">
                            <span className="font-bold text-indigo-600">{analytics.activeSessions}</span>
                        </InfoRow>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
                        <FaDatabase className="text-indigo-600" />
                        System Status
                    </h2>
                    <div className="divide-y divide-slate-100">
                        <InfoRow label="MongoDB">
                            <StatusDot ok={engineStatus?.mongodb === "CONNECTED"} label={engineStatus?.mongodb || "Unknown"} />
                        </InfoRow>
                        <InfoRow label="Vision Module">
                            <StatusDot ok={engineStatus?.visionModule === "READY"} label={engineStatus?.visionModule || "Unknown"} />
                        </InfoRow>
                        <InfoRow label="Registered Faces">
                            <span className="font-bold text-indigo-600">{engineStatus?.registeredFaces ?? "—"}</span>
                        </InfoRow>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
                        <FaMicrochip className="text-indigo-600" />
                        Recognition Summary
                    </h2>
                    <div className="divide-y divide-slate-100">
                        <InfoRow label="Accuracy">
                            <span className="font-bold text-emerald-600">{analytics.recognitionStats.accuracy}%</span>
                        </InfoRow>
                        <InfoRow label="Avg Confidence">
                            <span className="font-bold text-indigo-600">{analytics.recognitionStats.averageConfidence}%</span>
                        </InfoRow>
                        <InfoRow label="Unknown Faces">
                            <span className="font-bold text-red-600">{analytics.recognitionStats.unknownFaces}</span>
                        </InfoRow>
                    </div>
                </Card>

            </div>

            <AnalyticsCharts
                analytics={analytics}
            />

        </AppLayout>

    );

};

export default Analytics;
