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

const COLORS = [
    "#4F46E5",
    "#22C55E",
    "#F97316",
    "#EF4444",
    "#14B8A6",
    "#8B5CF6"
];

const AnalyticsCharts = ({ analytics }) => {

    return (

        <div className="space-y-8 mt-8">

            {/* Attendance Trend */}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-5">

                    📈 Attendance Trend (Last 30 Days)

                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <LineChart
                        data={analytics.attendanceTrend}
                    >

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="_id"/>

                        <YAxis/>

                        <Tooltip/>

                        <Legend/>

                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#4F46E5"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            {/* Subject Distribution */}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-5">

                    🥧 Subject-wise Attendance

                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <PieChart>

                        <Pie

                            data={analytics.subjectDistribution}

                            dataKey="value"

                            nameKey="_id"

                            outerRadius={120}

                            label

                        >

                            {

                                analytics.subjectDistribution.map(

                                    (_, index) => (

                                        <Cell

                                            key={index}

                                            fill={

                                                COLORS[index % COLORS.length]

                                            }

                                        />

                                    )

                                )

                            }

                        </Pie>

                        <Tooltip/>

                        <Legend/>

                    </PieChart>

                </ResponsiveContainer>

            </div>

            {/* Branch Attendance */}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-5">

                    📊 Branch-wise Students

                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart
                        data={analytics.branchAttendance}
                    >

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="_id"/>

                        <YAxis/>

                        <Tooltip/>

                        <Legend/>

                        <Bar
                            dataKey="students"
                            fill="#22C55E"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

            {/* Attendance Shortage */}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-5">

                    🚨 Attendance Shortage

                </h2>

                {

                    analytics.shortageStudents.length === 0

                    ?

                    <p className="text-green-600">

                        🎉 No students below 75%.

                    </p>

                    :

                    <table className="min-w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="text-left py-3">

                                    Student

                                </th>

                                <th className="text-right">

                                    Attendance %

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                analytics.shortageStudents.map(

                                    (student) => (

                                        <tr
                                            key={student.student}
                                            className="border-b"
                                        >

                                            <td className="py-3">

                                                {student.student}

                                            </td>

                                            <td className="text-right text-red-600 font-semibold">

                                                {student.percentage.toFixed(1)}%

                                            </td>

                                        </tr>

                                    )

                                )

                            }

                        </tbody>

                    </table>

                }

            </div>

            {/* Weekly Heatmap */}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-5">

                    📅 Weekly Attendance

                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                    <BarChart
                        data={analytics.weeklyHeatmap}
                    >

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="_id"/>

                        <YAxis/>

                        <Tooltip/>

                        <Bar
                            dataKey="attendance"
                            fill="#F97316"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

            {/* Recognition Statistics */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <div className="bg-white rounded-xl shadow p-6">

                    <h3 className="font-bold">

                        Accuracy

                    </h3>

                    <p className="text-3xl text-green-600 mt-3">

                        {analytics.recognitionStats.accuracy}%

                    </p>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                    <h3 className="font-bold">

                        Avg Confidence

                    </h3>

                    <p className="text-3xl text-indigo-600 mt-3">

                        {analytics.recognitionStats.averageConfidence}%

                    </p>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                    <h3 className="font-bold">

                        Unknown Faces

                    </h3>

                    <p className="text-3xl text-red-600 mt-3">

                        {analytics.recognitionStats.unknownFaces}

                    </p>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                    <h3 className="font-bold">

                        Avg Recognition Time

                    </h3>

                    <p className="text-3xl text-orange-600 mt-3">

                        {analytics.recognitionStats.recognitionTime}s

                    </p>

                </div>

            </div>

        </div>

    );

};

export default AnalyticsCharts;