import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import { FaCamera, FaCheckCircle, FaTimesCircle, FaClock, FaVideo, FaSyncAlt } from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import RecognitionSnapshot from "../components/RecognitionSnapshot";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import KpiCard from "../components/ui/KpiCard";
import useDataTable from "../hooks/useDataTable";

import { getRecognitionLogs } from "../services/recognitionLogService";

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "RECOGNIZED", label: "Recognized" },
    { value: "UNKNOWN", label: "Unknown" }
];

const getSortValue = (log, field) => {
    if (field === "capturedAt") return new Date(log.capturedAt).getTime();
    return null;
};

const RecognitionHistory = () => {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const loadLogs = async () => {

        try {
            const data = await getRecognitionLogs();
            setLogs(data.logs);
        }
        catch {
            toast.error("Failed to load recognition history");
        }
        finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        loadLogs();
    }, []);

    const filteredLogs = useMemo(() => {

        const text = search.toLowerCase();

        return logs.filter((log) => {

            const name = (log.student ? log.student.name : log.recognizedName) || "";
            const matchesSearch =
                !text ||
                name.toLowerCase().includes(text) ||
                (log.subject || "").toLowerCase().includes(text) ||
                (log.camera || "").toLowerCase().includes(text);

            const matchesStatus = statusFilter === "all" || log.status === statusFilter;

            return matchesSearch && matchesStatus;

        });

    }, [logs, search, statusFilter]);

    const { rows, page, setPage, totalPages, pageSize, total } =
        useDataTable(filteredLogs, { pageSize: 10, getSortValue });

    return (

        <AppLayout>

            <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                        Recognition History
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Every face recognition attempt, matched or unknown - click a
                        snapshot to see the bounding box full size.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

                <KpiCard
                    index={0}
                    title="Total Attempts"
                    value={logs.length}
                    icon={FaCamera}
                    tone="indigo"
                />

                <KpiCard
                    index={1}
                    title="Recognized"
                    value={logs.filter(l => l.status === "RECOGNIZED").length}
                    icon={FaCheckCircle}
                    tone="emerald"
                />

                <KpiCard
                    index={2}
                    title="Unknown Faces"
                    value={logs.filter(l => l.status === "UNKNOWN").length}
                    icon={FaTimesCircle}
                    tone="amber"
                />

            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                <div className="flex flex-wrap items-center gap-3">

                    <SearchBar
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by student, subject or camera..."
                    />

                    <div className="flex gap-2">
                        {
                            STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setStatusFilter(f.value)}
                                    className={
                                        `px-4 py-2 rounded-lg text-sm font-semibold transition ` +
                                        (statusFilter === f.value
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50")
                                    }
                                >
                                    {f.label}
                                </button>
                            ))
                        }
                    </div>

                </div>

                <button
                    onClick={() => {
                        setLoading(true);
                        loadLogs();
                    }}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <FaSyncAlt className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>

            </div>

            {
                loading ?
                <TableSkeleton rows={6} columns={4} showHeader={false} />
                :
                filteredLogs.length === 0 ?
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200">
                    <EmptyState
                        icon={FaCamera}
                        title={logs.length === 0 ? "No recognition attempts yet" : "No matches for that search"}
                        message={
                            logs.length === 0
                                ? "This fills up once recognition runs during an active session."
                                : "Try a different search term or status filter."
                        }
                    />
                </div>
                :
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">

                    <div className="divide-y divide-slate-100">
                        {
                            rows.map((log) => {

                                const recognized = log.status === "RECOGNIZED";
                                const name = log.student ? log.student.name : log.recognizedName;

                                return (

                                    <div
                                        key={log._id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition"
                                    >

                                        <RecognitionSnapshot
                                            snapshot={log.snapshot}
                                            boundingBox={log.boundingBox}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-800 truncate">
                                                    {name || "Unknown"}
                                                </h3>
                                                <span
                                                    className={
                                                        `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ` +
                                                        (recognized
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-200 text-slate-600")
                                                    }
                                                >
                                                    {recognized ? <FaCheckCircle /> : <FaTimesCircle />}
                                                    {log.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate mt-0.5">
                                                {log.subject || "—"}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <FaClock />
                                                    {new Date(log.capturedAt).toLocaleString()}
                                                </span>
                                                {
                                                    log.camera &&
                                                    <span className="flex items-center gap-1">
                                                        <FaVideo />
                                                        {log.camera}
                                                    </span>
                                                }
                                                {
                                                    log.durationMs &&
                                                    <span>
                                                        {(log.durationMs / 1000).toFixed(2)}s
                                                    </span>
                                                }
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-bold text-slate-800">
                                                {log.confidence}%
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                confidence
                                            </p>
                                        </div>

                                    </div>

                                );

                            })
                        }
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />

                </div>
            }

        </AppLayout>

    );

};

export default RecognitionHistory;
