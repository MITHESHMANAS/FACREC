import { useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";

import {
    downloadPdfReport,
    downloadExcelReport
} from "../services/reportService";

const Reports = () => {

    const [loading, setLoading] = useState(false);

    const handlePDF = async () => {

        try {

            setLoading(true);

            await downloadPdfReport();

            toast.success("PDF downloaded successfully");

        }

        catch (err) {

            console.error(err);

            toast.error(

                err.response?.data?.message ||

                err.message ||

                "Unable to generate PDF"

            );

        }

        finally {

            setLoading(false);

        }

    };

    const handleExcel = async () => {

        try {

            setLoading(true);

            await downloadExcelReport();

            toast.success("Excel downloaded successfully");

        }

        catch (err) {

            console.error(err);

            toast.error(

                err.response?.data?.message ||

                err.message ||

                "Unable to generate Excel"

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <div className="p-8">

                    <h1 className="text-4xl font-bold">
                        Reports
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Download attendance reports.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                        <StatsCard
                            title="PDF Reports"
                            value="Ready"
                            color="text-red-600"
                        />

                        <StatsCard
                            title="Excel Reports"
                            value="Ready"
                            color="text-green-600"
                        />

                        <StatsCard
                            title="Recognition Reports"
                            value="Ready"
                            color="text-indigo-600"
                        />

                    </div>

                    <div className="bg-white rounded-xl shadow p-8 mt-8">

                        <h2 className="text-2xl font-bold mb-6">
                            Generate Reports
                        </h2>

                        <div className="flex gap-4">

                            <button

                                onClick={handlePDF}

                                disabled={loading}

                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"

                            >

                                {

                                    loading

                                        ?

                                        "Generating..."

                                        :

                                        "📄 Generate PDF"

                                }

                            </button>

                            <button

                                onClick={handleExcel}

                                disabled={loading}

                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"

                            >

                                {

                                    loading

                                        ?

                                        "Generating..."

                                        :

                                        "📊 Export Excel"

                                }

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Reports;