import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import {
    FaCamera, FaCheckCircle, FaTimesCircle, FaClock, FaVideo, FaSyncAlt
} from "react-icons/fa";

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
        setLoading(true);
        try {
            const data = await getRecognitionLogs();
            setLogs(data.logs);
        } catch {
            toast.error("Failed to load recognition history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, []);

    const filteredLogs = useMemo(() => {
        const text = search.toLowerCase();
        return logs.filter((log) => {
            const name = (log.student ? log.student.name : log.recognizedName) || "";
            const matchesSearch = !text || name.toLowerCase().includes(text) || (log.subject || "").toLowerCase().includes(text) || (log.camera || "").toLowerCase().includes(text);
            const matchesStatus = statusFilter === "all" || log.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [logs, search, statusFilter]);

    const { rows, page, setPage, totalPages, pageSize, total } = useDataTable(filteredLogs, { pageSize: 10, getSortValue });

    return (
        <AppLayout>
            {/* The gap-y-8 container ensures sections don't touch */}
            <div className="flex flex-col gap-y-8 p-4">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Recognition History</h1>
                    <p className="text-slate-500 mt-1">Every face recognition attempt, matched or unknown - click a snapshot to see the bounding box full size.</p>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <KpiCard index={0} title="Total Attempts" value={logs.length} icon={FaCamera} tone="indigo" />
                    <KpiCard index={1} title="Recognized" value={logs.filter(l => l.status === "RECOGNIZED").length} icon={FaCheckCircle} tone="emerald" />
                    <KpiCard index={2} title="Unknown Faces" value={logs.filter(l => l.status === "UNKNOWN").length} icon={FaTimesCircle} tone="amber" />
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, subject or camera..." />
                        
                        {/* New Pill Style Filters */}
                        <div className="flex gap-2">
                            {STATUS_FILTERS.map((f) => {
                                const isActive = statusFilter === f.value;
                                return (
                                    <button
                                        key={f.value}
                                        onClick={() => setStatusFilter(f.value)}
                                        className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 border ${
                                            isActive 
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button onClick={loadLogs} className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-2xl text-sm font-bold transition">
                        <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* List Container */}
                {loading ? <TableSkeleton rows={6} columns={4} showHeader={false} /> : (
                    filteredLogs.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
                            <EmptyState icon={FaCamera} title="No recognition attempts" message="History fills up once recognition runs." />
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {rows.map((log) => {
                                    const recognized = log.status === "RECOGNIZED";
                                    const name = log.student ? log.student.name : log.recognizedName;
                                    return (
                                        <div key={log._id} className="flex items-center gap-6 px-8 py-6 hover:bg-slate-50 transition">
                                            <RecognitionSnapshot snapshot={log.snapshot} boundingBox={log.boundingBox} />
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-slate-900 text-base">{name || "Unknown"}</h3>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${recognized ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                                        {recognized ? <FaCheckCircle /> : <FaTimesCircle />} {log.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">{log.subject || "—"}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-medium">
                                                    <span className="flex items-center gap-1.5"><FaClock /> {new Date(log.capturedAt).toLocaleString()}</span>
                                                    {log.camera && <span className="flex items-center gap-1.5"><FaVideo /> {log.camera}</span>}
                                                    {log.durationMs && <span>{(log.durationMs / 1000).toFixed(2)}s</span>}
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-2xl font-black text-slate-900">{log.confidence}%</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidence</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-6 border-t border-slate-100">
                                <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
                            </div>
                        </div>
                    )
                )}
            </div>
        </AppLayout>
    );
};

export default RecognitionHistory;