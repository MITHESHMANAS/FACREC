import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCamera,
    FaPlay,
    FaMicrochip,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaVideo,
    FaUserCheck
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import RecognitionResultCard from "../components/RecognitionResultCard";

import {
    getEngineStatus,
    startRecognition
} from "../services/recognitionService";
import { getRecognitionLogs } from "../services/recognitionLogService";

const isToday = (dateString) => {

    const d = new Date(dateString);
    const now = new Date();

    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );

};

const Recognition = () => {

    const [engine, setEngine] = useState(null);

    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState(null);

    const [todaysLogs, setTodaysLogs] = useState([]);

    const loadStatus = async () => {

        try {

            const data = await getEngineStatus();

            setEngine(data);

        }

        catch {

            toast.error("Unable to connect to Recognition Engine.");

        }

    };

    const loadTodaysLogs = async () => {

        try {

            const data = await getRecognitionLogs();

            setTodaysLogs((data.logs || []).filter(l => isToday(l.capturedAt)));

        }

        catch {

            setTodaysLogs([]);

        }

    };

    useEffect(() => {

        loadStatus();
        loadTodaysLogs();

    }, []);

    const handleRecognition = async () => {

        try {

            setLoading(true);

            // Clear the previous run's results immediately rather than
            // leaving stale cards on screen while a new scan is in
            // progress - otherwise a slow scan can look like nothing
            // happened yet, when actually old data is just still shown.
            setResult(null);

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

            // The scan itself may have changed the engine's state
            // (e.g. registered face count if this ties into future
            // features) - refresh so the status cards don't go stale.
            loadStatus();
            loadTodaysLogs();

        }

    };

    const engineReady = engine?.visionModule === "READY";

    return (

        <AppLayout>

            <div className="flex justify-between items-center flex-wrap gap-4">

                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                        Live Face Recognition
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Camera-based attendance recognition
                    </p>
                </div>

                <Button
                    onClick={handleRecognition}
                    loading={loading}
                    size="lg"
                    icon={<FaPlay />}
                >
                    {
                        loading
                            ? "Recognizing..."
                            : "Start Recognition"
                    }
                </Button>

            </div>

            <div className="grid md:grid-cols-4 gap-6 mt-6">

                <KpiCard
                    index={0}
                    title="Today's Recognitions"
                    value={todaysLogs.filter(l => l.status === "RECOGNIZED").length}
                    icon={FaCheckCircle}
                    tone="indigo"
                />

                <KpiCard
                    index={1}
                    title="Accuracy"
                    value={
                        todaysLogs.length > 0
                            ? `${Math.round(
                                (todaysLogs.filter(l => l.status === "RECOGNIZED").length / todaysLogs.length) * 100
                            )}%`
                            : "—"
                    }
                    icon={FaMicrochip}
                    tone="emerald"
                />

                <KpiCard
                    index={2}
                    title="Unknown Faces"
                    value={todaysLogs.filter(l => l.status === "UNKNOWN").length}
                    icon={FaTimesCircle}
                    tone="amber"
                />

                <KpiCard
                    index={3}
                    title="Camera Status"
                    value={engine?.status || "Unknown"}
                    icon={FaVideo}
                    tone={engineReady ? "emerald" : "red"}
                />

            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">

                {/* Live camera hero card */}

                <Card padding="lg" className="relative overflow-hidden">

                    <div className="flex items-center gap-4">

                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${loading ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                            <FaCamera />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Recognition Status
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {
                                    loading
                                        ? "Scanning for faces..."
                                        : "Ready to detect faces"
                                }
                            </p>
                        </div>

                    </div>

                    <div className="mt-6">

                        <div className="relative bg-slate-900 rounded-[20px] h-72 flex justify-center items-center overflow-hidden">

                            {/* Corner brackets - viewfinder framing */}

                            <div className="absolute inset-5 pointer-events-none">
                                <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-400/70 rounded-tl-lg" />
                                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-400/70 rounded-tr-lg" />
                                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-400/70 rounded-bl-lg" />
                                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-400/70 rounded-br-lg" />
                            </div>

                            {/* Scanning line while a recognition run is in flight */}

                            <AnimatePresence>
                                {
                                    loading &&
                                    <motion.div
                                        initial={{ top: "10%", opacity: 0 }}
                                        animate={{
                                            top: ["10%", "90%", "10%"],
                                            opacity: 1
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            top: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="absolute left-5 right-5 h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]"
                                    />
                                }
                            </AnimatePresence>

                            <div className="text-center relative z-10 px-6">

                                <motion.div
                                    animate={loading ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                    transition={{ duration: 1.2, repeat: loading ? Infinity : 0 }}
                                >
                                    <FaCamera className="text-5xl mx-auto text-slate-500" />
                                </motion.div>

                                <p className="mt-4 text-slate-400 text-sm max-w-xs mx-auto">
                                    Camera preview isn't streamed to the browser -
                                    recognition runs server-side against the
                                    connected webcam.
                                </p>

                            </div>

                        </div>

                    </div>

                </Card>

                {/* Recognition result panel */}

                <Card padding="lg">

                    <h2 className="text-lg font-semibold text-slate-800 mb-6">
                        Recognition Result
                    </h2>

                    {
                        result?.recognitionLogs?.length > 0
                            ?
                            <div className="space-y-3">
                                {
                                    result.recognitionLogs.map((log, index) => (
                                        <RecognitionResultCard
                                            key={index}
                                            log={log}
                                            index={index}
                                        />
                                    ))
                                }
                            </div>
                            :
                            <EmptyState
                                icon={FaMicrochip}
                                title="No recognition run yet"
                                message='Click "Start Recognition" above to scan for faces.'
                            />
                    }

                </Card>

            </div>

            <Card padding="lg" className="mt-6">

                <h2 className="text-lg font-semibold text-slate-800 mb-6">
                    Last Run Details
                </h2>

                <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-6">

                    <div className="flex items-center gap-3">
                        <FaClock className="text-2xl text-indigo-600" />
                        <div>
                            <p className="text-xs text-gray-400">
                                Execution Time
                            </p>
                            <p className="font-medium text-slate-700">
                                {result?.executionTime || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <FaMicrochip className="text-2xl text-indigo-600" />
                        <div>
                            <p className="text-xs text-gray-400">
                                Engine Status
                            </p>
                            <p className="font-medium text-slate-700">
                                {engine?.status || "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <FaCheckCircle className="text-2xl text-indigo-600" />
                        <div>
                            <p className="text-xs text-gray-400">
                                Total Recognized
                            </p>
                            <p className="font-medium text-slate-700">
                                {result?.total ?? 0}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <FaCamera className="text-2xl text-indigo-600" />
                        <div>
                            <p className="text-xs text-gray-400">
                                Vision Module
                            </p>
                            <p className="font-medium text-slate-700">
                                {engine?.visionModule || "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <FaUserCheck className="text-2xl text-indigo-600" />
                        <div>
                            <p className="text-xs text-gray-400">
                                Registered Faces
                            </p>
                            <p className="font-medium text-slate-700">
                                {engine?.registeredFaces ?? "—"}
                            </p>
                        </div>
                    </div>

                </div>

            </Card>

        </AppLayout>

    );

};

export default Recognition;
