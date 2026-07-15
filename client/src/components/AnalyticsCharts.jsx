import {
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";
import {
    FaChartLine,
    FaChartPie,
    FaChartBar,
    FaExclamationTriangle,
    FaCalendarWeek,
    FaMicrochip,
    FaBullseye,
    FaUserSlash,
    FaClipboardList,
    FaCheckCircle,
    FaLayerGroup
} from "react-icons/fa";

import Card from "./ui/Card";
import KpiCard from "./ui/KpiCard";
import EmptyState from "./ui/EmptyState";

const COLORS = [
    "#4F46E5",
    "#22C55E",
    "#F97316",
    "#EF4444",
    "#14B8A6",
    "#8B5CF6"
];

const TOOLTIP_STYLE = {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
    fontSize: 13
};

const SectionTitle = ({ icon: Icon, children }) => (
    <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5 text-slate-800">
        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
            <Icon />
        </span>
        {children}
    </h2>
);

const AnalyticsCharts = ({ analytics }) => {

    return (

        <div className="space-y-6 mt-8">

            {/* Attendance Trend */}

            <Card>

                <SectionTitle icon={FaChartLine}>
                    Attendance Trend (Last 30 Days)
                </SectionTitle>

                <ResponsiveContainer width="100%" height={340}>

                    <LineChart data={analytics.attendanceTrend}>

                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            dot={{ r: 3, fill: "#4F46E5" }}
                            activeDot={{ r: 5 }}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </Card>

            <div className="grid lg:grid-cols-2 gap-6">

                {/* Subject Distribution */}

                <Card>

                    <SectionTitle icon={FaChartPie}>
                        Subject-wise Attendance
                    </SectionTitle>

                    <ResponsiveContainer width="100%" height={320}>

                        <PieChart>

                            <Pie
                                data={analytics.subjectDistribution}
                                dataKey="value"
                                nameKey="_id"
                                outerRadius={110}
                                label
                            >
                                {
                                    analytics.subjectDistribution.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))
                                }
                            </Pie>

                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </Card>

                {/* Branch Attendance */}

                <Card>

                    <SectionTitle icon={FaChartBar}>
                        Branch-wise Students
                    </SectionTitle>

                    <ResponsiveContainer width="100%" height={320}>

                        <BarChart data={analytics.branchAttendance}>

                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="_id" tick={{ fontSize: 12, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Legend />
                            <Bar dataKey="students" fill="#22C55E" radius={[6, 6, 0, 0]} />

                        </BarChart>

                    </ResponsiveContainer>

                </Card>

            </div>

            {/* Attendance Shortage */}

            <Card>

                <SectionTitle icon={FaExclamationTriangle}>
                    Attendance Shortage
                </SectionTitle>

                {
                    analytics.shortageStudents.length === 0
                        ?
                        <EmptyState
                            icon={FaCheckCircle}
                            title="No students below 75%"
                            message="Everyone is currently meeting the attendance requirement."
                        />
                        :
                        <div className="overflow-x-auto -mx-6">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="text-left px-6 py-3 font-semibold">Student</th>
                                        <th className="text-right px-6 py-3 font-semibold">Attendance %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        analytics.shortageStudents.map((student) => (
                                            <tr
                                                key={student.student}
                                                className="border-t border-slate-100 hover:bg-red-50/40 transition"
                                            >
                                                <td className="px-6 py-3 font-medium text-slate-700">
                                                    {student.student}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className="inline-block bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        {student.percentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                }

            </Card>

            {/* Weekly Heatmap */}

            <Card>

                <SectionTitle icon={FaCalendarWeek}>
                    Weekly Attendance
                </SectionTitle>

                <ResponsiveContainer width="100%" height={300}>

                    <BarChart data={analytics.weeklyHeatmap}>

                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="attendance" fill="#F59E0B" radius={[6, 6, 0, 0]} />

                    </BarChart>

                </ResponsiveContainer>

            </Card>

            {/* Recognition Statistics */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <KpiCard index={0} title="Accuracy" value={`${analytics.recognitionStats.accuracy}%`} icon={FaBullseye} tone="emerald" />
                <KpiCard index={1} title="Avg Confidence" value={`${analytics.recognitionStats.averageConfidence}%`} icon={FaMicrochip} tone="indigo" />
                <KpiCard index={2} title="Unknown Faces" value={analytics.recognitionStats.unknownFaces} icon={FaUserSlash} tone="red" />
                <KpiCard index={3} title="Total Recognition Attempts" value={analytics.recognitionStats.totalAttempts} icon={FaClipboardList} tone="amber" />

            </div>

            {/* Session-wise Attendance (expected vs present vs absent) */}

            <Card>

                <SectionTitle icon={FaLayerGroup}>
                    Recent Sessions - Expected vs Present vs Absent
                </SectionTitle>

                {
                    !analytics.sessionSummary || analytics.sessionSummary.length === 0
                        ?
                        <EmptyState
                            icon={FaLayerGroup}
                            title="No completed sessions yet"
                            message="This chart fills in once sessions are marked ended."
                        />
                        :
                        <ResponsiveContainer width="100%" height={340}>

                            <BarChart
                                data={analytics.sessionSummary.map((s) => ({
                                    name: s.subject?.name || "Unknown",
                                    Expected: s.expectedStudents,
                                    Present: s.presentStudents,
                                    Absent: s.absentStudents
                                }))}
                            >

                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend />
                                <Bar dataKey="Expected" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Present" fill="#22C55E" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} />

                            </BarChart>

                        </ResponsiveContainer>
                }

            </Card>

        </div>

    );

};

export default AnalyticsCharts;
