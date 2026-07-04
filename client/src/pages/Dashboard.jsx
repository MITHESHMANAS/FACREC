import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

import { getDashboardStats } from "../services/dashboardService";

const Dashboard = () => {

    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        subjects: 0,
        sessions: 0,
        attendance: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const data = await getDashboardStats();

                setStats(data.stats);

            }

            catch (err) {

                console.error(err);

            }

            finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <main className="p-8">

                    <h1 className="text-3xl font-bold mb-6">
                        Dashboard
                    </h1>

                    {
                        loading ?

                            <h2>Loading Dashboard...</h2>

                            :

                            <div className="grid grid-cols-4 gap-6">

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

                    }

                </main>

            </div>

        </div>

    );

};

export default Dashboard;