import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

import { getDashboardStats } from "../services/dashboardService";

import useAttendanceSocket from "../hooks/useAttendanceSocket";

const Dashboard = () => {

    const [stats, setStats] = useState({

        students: 0,

        faculty: 0,

        subjects: 0,

        sessions: 0,

        attendance: 0

    });

    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {

        try {

            const data = await getDashboardStats();

            setStats(data.stats);

        }

        catch (err) {

            console.error(err);

            toast.error("Unable to load dashboard");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadDashboard();

    }, []);

    // ======================================================
    // Live Attendance Updates
    // ======================================================

    useAttendanceSocket(() => {

        loadDashboard();

    });

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <main className="p-8">

                    <div className="flex justify-between items-center mb-8">

                        <div>

                            <h1 className="text-4xl font-bold">

                                Dashboard

                            </h1>

                            <p className="text-gray-500 mt-2">

                                FACREC Enterprise Live Dashboard

                            </p>

                        </div>

                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold">

                            🟢 LIVE

                        </div>

                    </div>

                    {

                        loading ?

                        <div className="text-center py-20">

                            Loading Dashboard...

                        </div>

                        :

                        <>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                                <StatCard

                                    title="Students"

                                    value={stats.students}

                                />

                                <StatCard

                                    title="Faculty"

                                    value={stats.faculty}

                                />

                                <StatCard

                                    title="Subjects"

                                    value={stats.subjects}

                                />

                                <StatCard

                                    title="Attendance"

                                    value={`${stats.attendance}%`}

                                />

                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

                                <h2 className="text-2xl font-bold mb-4">

                                    Live Activity

                                </h2>

                                <p className="text-gray-500">

                                    Dashboard is connected to the FACREC
                                    Socket.IO server.

                                </p>

                                <div className="mt-6 flex items-center gap-3">

                                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>

                                    <span className="font-semibold text-green-600">

                                        Waiting for attendance updates...

                                    </span>

                                </div>

                            </div>

                        </>

                    }

                </main>

            </div>

        </div>

    );

};

export default Dashboard;