import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    FaCamera,
    FaPlay,
    FaUserGraduate,
    FaCheckCircle,
    FaMicrochip,
    FaClock
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";

import {
    getEngineStatus,
    startRecognition
} from "../services/recognitionService";

const Recognition = () => {

    const [engine, setEngine] = useState(null);

    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState(null);

    const loadStatus = async () => {

        try {

            const data = await getEngineStatus();

            setEngine(data);

        }

        catch {

            toast.error("Unable to connect to Recognition Engine.");

        }

    };

    useEffect(() => {

        loadStatus();

    }, []);

    const handleRecognition = async () => {

        try {

            setLoading(true);

            const data = await startRecognition();

            setResult(data);

            if (data.total > 0) {

                toast.success("Face Recognized Successfully");

            }

            else {

                toast("No Face Recognized");

            }

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                "Recognition Failed"

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

                    <div className="flex justify-between items-center">

                        <div>

                            <h1 className="text-4xl font-bold">

                                Live Face Recognition

                            </h1>

                            <p className="text-gray-500 mt-2">

                                AI Powered Attendance Recognition

                            </p>

                        </div>

                        <button

                            onClick={handleRecognition}

                            disabled={loading}

                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-3"

                        >

                            <FaPlay />

                            {

                                loading

                                    ? "Recognizing..."

                                    : "Start Recognition"

                            }

                        </button>

                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-8">

                        <StatsCard

                            title="Camera"

                            value="ONLINE"

                            color="text-green-600"

                        />

                        <StatsCard

                            title="Recognition Engine"

                            value={engine?.status || "OFFLINE"}

                            color="text-indigo-600"

                        />

                        <StatsCard

                            title="Today's Recognition"

                            value={result?.total || 0}

                            color="text-orange-600"

                        />

                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 mt-8">

                        <div className="bg-white rounded-2xl shadow-lg p-8">

                            <div className="flex items-center gap-4">

                                <FaCamera

                                    className="text-5xl text-indigo-600"

                                />

                                <div>

                                    <h2 className="text-2xl font-bold">

                                        Recognition Status

                                    </h2>

                                    <p className="text-gray-500">

                                        Ready to detect faces

                                    </p>

                                </div>

                            </div>

                            <div className="mt-8">

                                <div className="bg-slate-100 rounded-xl h-80 flex justify-center items-center">

                                    <div className="text-center">

                                        <FaCamera

                                            className="text-7xl mx-auto text-gray-400"

                                        />

                                        <p className="mt-4 text-gray-500">

                                            Camera Preview

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8">

                            <h2 className="text-2xl font-bold mb-6">

                                Recognition Result

                            </h2>

                            {

                                result?.recognized?.length > 0

                                    ?

                                    result.recognized.map((student, index) => (

                                        <div

                                            key={index}

                                            className="border rounded-xl p-5 mb-5"

                                        >

                                            <div className="flex items-center gap-4">

                                                <FaUserGraduate

                                                    className="text-4xl text-indigo-600"

                                                />

                                                <div>

                                                    <h3 className="text-xl font-bold">

                                                        {student.name}

                                                    </h3>

                                                    <p>

                                                        {student.subject}

                                                    </p>

                                                </div>

                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-6">

                                                <div>

                                                    <p className="text-gray-500">

                                                        Confidence

                                                    </p>

                                                    <h2 className="font-bold">

                                                        {student.confidence}%

                                                    </h2>

                                                </div>

                                                <div>

                                                    <p className="text-gray-500">

                                                        Status

                                                    </p>

                                                    <div className="flex items-center gap-2 text-green-600">

                                                        <FaCheckCircle />

                                                        {student.status}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    ))

                                    :

                                    <div className="text-center py-20">

                                        <FaMicrochip

                                            className="text-6xl mx-auto text-gray-400"

                                        />

                                        <p className="mt-6 text-gray-500">

                                            No Recognition Yet

                                        </p>

                                    </div>

                            }

                        </div>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

                        <h2 className="text-2xl font-bold mb-6">

                            Engine Information

                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">

                            <div>

                                <FaClock className="text-3xl text-indigo-600" />

                                <h3 className="font-semibold mt-3">

                                    Execution Time

                                </h3>

                                <p>

                                    {result?.executionTime || "--"}

                                </p>

                            </div>

                            <div>

                                <FaMicrochip className="text-3xl text-green-600" />

                                <h3 className="font-semibold mt-3">

                                    Engine Status

                                </h3>

                                <p>

                                    {engine?.status || "OFFLINE"}

                                </p>

                            </div>

                            <div>

                                <FaCheckCircle className="text-3xl text-orange-600" />

                                <h3 className="font-semibold mt-3">

                                    Total Recognized

                                </h3>

                                <p>

                                    {result?.total || 0}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Recognition;