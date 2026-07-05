import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import AnalyticsCharts from "../components/AnalyticsCharts";

import { getAnalytics } from "../services/analyticsService";

const Analytics = () => {

    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(true);

    const loadAnalytics = async () => {

        try {

            const data = await getAnalytics();

            setAnalytics(data);

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

            <div className="flex justify-center items-center h-screen">

                <BeatLoader color="#4F46E5" />

            </div>

        );

    }

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <div className="p-8">

                    <div className="flex justify-between items-center mb-8">

                        <div>

                            <h1 className="text-4xl font-bold">

                                Analytics Dashboard

                            </h1>

                            <p className="text-gray-500 mt-2">

                                Attendance Analytics & Face Recognition Insights

                            </p>

                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                        <StatsCard

                            title="Students"

                            value={analytics.totalStudents}

                            color="text-indigo-600"

                        />

                        <StatsCard

                            title="Sessions"

                            value={analytics.totalSessions}

                            color="text-green-600"

                        />

                        <StatsCard

                            title="Attendance"

                            value={analytics.totalAttendance}

                            color="text-orange-600"

                        />

                        <StatsCard

                            title="Today's Attendance"

                            value={analytics.todayAttendance}

                            color="text-red-600"

                        />

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                        <div className="bg-white rounded-xl shadow p-6">

                            <h2 className="text-lg font-bold mb-4">

                                Attendance Overview

                            </h2>

                            <div className="space-y-3">

                                <div className="flex justify-between">

                                    <span>

                                        Present

                                    </span>

                                    <span className="font-bold text-green-600">

                                        {analytics.present}

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>

                                        Absent

                                    </span>

                                    <span className="font-bold text-red-600">

                                        {analytics.absent}

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>

                                        Active Sessions

                                    </span>

                                    <span className="font-bold text-indigo-600">

                                        {analytics.activeSessions}

                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="bg-white rounded-xl shadow p-6">

                            <h2 className="text-lg font-bold mb-4">

                                System Status

                            </h2>

                            <div className="space-y-3">

                                <div className="flex justify-between">

                                    <span>

                                        Camera

                                    </span>

                                    <span className="text-green-600">

                                        ● Online

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>

                                        Recognition Engine

                                    </span>

                                    <span className="text-green-600">

                                        ● Running

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>

                                        MongoDB

                                    </span>

                                    <span className="text-green-600">

                                        ● Connected

                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="bg-white rounded-xl shadow p-6">

                            <h2 className="text-lg font-bold mb-4">

                                Recognition Summary

                            </h2>

                            <div className="space-y-3">

                                <div className="flex justify-between">

                                    <span>

                                        Accuracy

                                    </span>

                                    <span className="font-bold text-green-600">

                                        {analytics.recognitionStats.accuracy}%

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>

                                        Avg Confidence

                                    </span>

                                    <span className="font-bold text-indigo-600">

                                        {analytics.recognitionStats.averageConfidence}%

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>

                                        Unknown Faces

                                    </span>

                                    <span className="font-bold text-red-600">

                                        {analytics.recognitionStats.unknownFaces}

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                    <AnalyticsCharts

                        analytics={analytics}

                    />

                </div>

            </div>

        </div>

    );

};

export default Analytics;