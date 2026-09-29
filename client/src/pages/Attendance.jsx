import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import {
    FaVideo, FaPlus, FaClipboardList, FaUserCheck, FaUserTimes,
    FaUserGraduate, FaCircle, FaExclamationTriangle, FaCheckCircle,
    FaFilter, FaSyncAlt, FaTimes
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceForm from "../components/AttendanceForm";

import { getAttendance, markAttendance, deleteAttendance } from "../services/attendanceService";
import { startRecognition } from "../services/recognitionService";
import { getSessions } from "../services/sessionService";
import { getFaculty } from "../services/facultyService";
import useAttendanceSocket from "../hooks/useAttendanceSocket";
import { useAuth } from "../context/AuthContext";

/* ------------------------------------------------------------------ */
/* filter / sort helpers                                               */
/* ------------------------------------------------------------------ */

// Local calendar date (YYYY-MM-DD); toISOString() would be the UTC date.
const toLocalISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);                        // Sunday
    return [toLocalISO(start), toLocalISO(end)];
};

const sessionStamp = (r) => `${r.session?.date || "0000-00-00"}T${r.session?.startTime || "00:00"}`;
const markedStamp = (r) => String(r.markedAt || r.createdAt || "");

const SORTERS = {
    // Records of the live session first (newest mark on top, so the
    // face-recognition feed reads like a live log), then history.
    smart: (a, b) => {
        const la = a.session?.status === "ACTIVE" ? 0 : 1;
        const lb = b.session?.status === "ACTIVE" ? 0 : 1;
        if (la !== lb) return la - lb;
        return sessionStamp(b).localeCompare(sessionStamp(a)) || markedStamp(b).localeCompare(markedStamp(a));
    },
    newest: (a, b) => sessionStamp(b).localeCompare(sessionStamp(a)) || markedStamp(b).localeCompare(markedStamp(a)),
    oldest: (a, b) => sessionStamp(a).localeCompare(sessionStamp(b)) || markedStamp(a).localeCompare(markedStamp(b)),
    name: (a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""),
    roll: (a, b) => (a.student?.rollNo || "").localeCompare(b.student?.rollNo || "", undefined, { numeric: true })
};

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "Present", label: "Present" },
    { key: "Absent", label: "Absent" }
];

const DATE_PRESETS = [
    { key: "all", label: "All dates" },
    { key: "today", label: "Today" },
    { key: "week", label: "This week" },
    { key: "custom", label: "Custom range" }
];

const selectClass =
    "h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition";

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [facultyMap, setFacultyMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recognizing, setRecognizing] = useState(false);
    const [recognizedStudents, setRecognizedStudents] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [allSessions, setAllSessions] = useState([]);
    const [sessionFilter, setSessionFilter] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");
    const [datePreset, setDatePreset] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortMode, setSortMode] = useState("smart");
    const [open, setOpen] = useState(false);
    const [deleteAttendanceData, setDeleteAttendanceData] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const loadAttendance = async (filterOverride) => {
        try {
            const filterValue = filterOverride !== undefined ? filterOverride : sessionFilter;
            const data = await getAttendance(filterValue ? { session: filterValue } : {});
            setAttendance(data.attendance);
        } catch (err) {
            toast.error("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    const loadActiveSession = async () => {
        try {
            const [sessionData, facultyData] = await Promise.all([getSessions(), getFaculty()]);
            
            const fList = Array.isArray(facultyData) ? facultyData : (facultyData?.faculty || []);
            const fMap = {};
            fList.forEach(f => { if (f._id) fMap[f._id] = f.name; });
            setFacultyMap(fMap);

            // live session first, then newest by date/time
            const sorted = [...(sessionData.sessions || [])].sort((a, b) => {
                const la = a.status === "ACTIVE" ? 0 : 1;
                const lb = b.status === "ACTIVE" ? 0 : 1;
                if (la !== lb) return la - lb;
                return `${b.date}T${b.startTime || ""}`.localeCompare(`${a.date}T${a.startTime || ""}`);
            });
            setAllSessions(sorted);
            const active = sorted.find(s => s.status === "ACTIVE");
            setActiveSession(active || null);
            setSessionFilter((current) => (current !== null ? current : (active ? active._id : "")));
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => { loadActiveSession(); }, []);
    useEffect(() => { if (sessionFilter !== null) loadAttendance(sessionFilter); }, [sessionFilter]);

    useAttendanceSocket(() => loadAttendance(), () => loadActiveSession());

    const handleSaveAttendance = async (record) => {
        try { setSaving(true); await markAttendance(record); toast.success("Attendance Marked"); setOpen(false); loadAttendance(); }
        catch (err) { toast.error(err.response?.data?.message || "Operation Failed"); }
        finally { setSaving(false); }
    };

    const handleRecognition = async () => {
        if (!activeSession) { toast.error("Please start a session first."); return; }
        try {
            setRecognizing(true);
            toast.loading("Starting...", { id: "recognition" });
            const result = await startRecognition();
            toast.dismiss("recognition");
            toast.success(`${result.total} student(s) recognized`);
            setRecognizedStudents(result.recognized || []);
            await loadAttendance();
        } catch (err) { toast.dismiss("recognition"); toast.error(err.response?.data?.message || "Recognition Failed"); }
        finally { setRecognizing(false); }
    };

    const handleDelete = (record) => setDeleteAttendanceData(record);
    const confirmDelete = async () => {
        try { setSaving(true); await deleteAttendance(deleteAttendanceData._id); toast.success("Attendance Deleted"); setDeleteAttendanceData(null); loadAttendance(); }
        catch (err) { toast.error(err.response?.data?.message || "Delete Failed"); }
        finally { setSaving(false); }
    };

    const subjectOptions = useMemo(() => {
        const map = new Map();
        attendance.forEach(r => {
            const sub = r.session?.subject;
            if (sub?._id) map.set(sub._id, sub.name);
        });
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [attendance]);

    const facultyOptions = useMemo(() => {
        const map = new Map();
        attendance.forEach(r => {
            const f = r.session?.faculty;
            if (f) map.set(f, facultyMap[f] || f);
        });
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [attendance, facultyMap]);

    // Everything except the status tab, so tab counts and KPI cards
    // always describe the same set of records.
    const matchesOtherFilters = useCallback((r) => {
        const text = search.trim().toLowerCase();

        if (text) {
            const hit =
                r.student?.name?.toLowerCase().includes(text) ||
                r.student?.rollNo?.toLowerCase().includes(text) ||
                r.session?.subject?.name?.toLowerCase().includes(text);
            if (!hit) return false;
        }

        if (subjectFilter !== "all" && r.session?.subject?._id !== subjectFilter) return false;
        if (facultyFilter !== "all" && r.session?.faculty !== facultyFilter) return false;

        const date = r.session?.date || "";

        if (datePreset === "today" && date !== toLocalISO(new Date())) return false;
        if (datePreset === "week") {
            const [start, end] = getWeekRange();
            if (date < start || date > end) return false;
        }
        if (datePreset === "custom") {
            if (fromDate && date < fromDate) return false;
            if (toDate && date > toDate) return false;
        }

        return true;
    }, [search, subjectFilter, facultyFilter, datePreset, fromDate, toDate]);

    const scopedRecords = useMemo(
        () => attendance.filter(matchesOtherFilters),
        [attendance, matchesOtherFilters]
    );

    const statusCounts = useMemo(() => ({
        all: scopedRecords.length,
        Present: scopedRecords.filter(r => r.status === "Present").length,
        Absent: scopedRecords.filter(r => r.status === "Absent").length
    }), [scopedRecords]);

    const filteredAttendance = useMemo(() => {
        const list = statusFilter === "all"
            ? scopedRecords
            : scopedRecords.filter(r => r.status === statusFilter);
        return [...list].sort(SORTERS[sortMode] || SORTERS.smart);
    }, [scopedRecords, statusFilter, sortMode]);

    const hasActiveFilters =
        search.trim() !== "" ||
        statusFilter !== "all" ||
        subjectFilter !== "all" ||
        facultyFilter !== "all" ||
        datePreset !== "all";

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setSubjectFilter("all");
        setFacultyFilter("all");
        setDatePreset("all");
        setFromDate("");
        setToDate("");
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Attendance</h1>
                    <RoleGuard roles={["admin", "faculty"]}>
                        <div className="flex gap-3 flex-wrap">
                            <Button onClick={handleRecognition} loading={recognizing} disabled={!activeSession} variant={activeSession ? "success" : "secondary"} icon={<FaVideo />}>
                                {activeSession ? "Start Face Recognition" : "No Active Session"}
                            </Button>
                            <Button onClick={() => setOpen(true)} icon={<FaPlus />}>Manual Attendance</Button>
                        </div>
                    </RoleGuard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard index={0} title="Records" value={scopedRecords.length} icon={FaClipboardList} tone="indigo" />
                    <KpiCard index={1} title="Present" value={statusCounts.Present} icon={FaUserCheck} tone="emerald" />
                    <KpiCard index={2} title="Absent" value={statusCounts.Absent} icon={FaUserTimes} tone="red" />
                    <KpiCard index={3} title="Students" value={new Set(scopedRecords.map(a => a.student?._id)).size} icon={FaUserGraduate} tone="amber" />
                </div>

                {activeSession ? (
                    <Card accent="border-l-emerald-500">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                                    <FaCircle className="text-emerald-500 text-xs animate-pulse" /> Active Session
                                </h2>
                                <div className="mt-3 space-y-1 text-sm text-slate-600">
                                    <p><span className="font-semibold text-slate-800">Subject:</span> {activeSession.subject?.name}</p>
                                    <p>
                                        <span className="font-semibold text-slate-800">Faculty:</span>{" "}
                                        {facultyMap[activeSession.faculty] || activeSession.faculty || "—"}
                                    </p>
                                    <p><span className="font-semibold text-slate-800">Semester:</span> {activeSession.semester}</p>
                                    <p><span className="font-semibold text-slate-800">Branch:</span> {activeSession.branch}</p>
                                </div>
                            </div>
                            <span className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold">ACTIVE</span>
                        </div>
                    </Card>
                ) : (
                    <Card accent="border-l-amber-500">
                        <h2 className="text-lg font-bold text-amber-700 flex items-center gap-2"><FaExclamationTriangle /> No Active Session</h2>
                        <p className="mt-2 text-slate-600 text-sm">Start a session before beginning face recognition.</p>
                    </Card>
                )}

                {recognizedStudents.length > 0 && (
                    <Card>
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Recognition Results</h2>
                        <div className="divide-y divide-slate-100">
                            {recognizedStudents.map((s) => (
                                <div key={s.name} className="flex justify-between items-center py-3">
                                    <div className="flex items-center gap-2.5">
                                        <FaCheckCircle className="text-emerald-500" />
                                        <div><p className="font-medium text-slate-800">{s.name}</p><p className="text-sm text-gray-500">{s.subject}</p></div>
                                    </div>
                                    <div className="text-right"><p className="text-emerald-600 font-semibold text-sm">{s.status}</p><p className="text-xs text-gray-500">{s.confidence}%</p></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Filter toolbar */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">

                    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                        <SearchBar
                            className="max-w-[300px] flex-1 min-w-[200px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student, roll no or subject..."
                        />

                        <select
                            value={sessionFilter ?? ""}
                            onChange={(e) => setSessionFilter(e.target.value)}
                            className={`${selectClass} w-56`}
                            aria-label="Filter by session"
                        >
                            <option value="">All Sessions (history)</option>
                            {allSessions.map((session) => (
                                <option key={session._id} value={session._id}>
                                    {session.status === "ACTIVE" ? "● LIVE - " : ""}
                                    {session.subject?.code ? `${session.subject.code} - ` : ""}{session.subject?.name} ({session.date})
                                </option>
                            ))}
                        </select>

                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className={`${selectClass} w-40`}
                            aria-label="Filter by subject"
                        >
                            <option value="all">All Subjects</option>
                            {subjectOptions.map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>

                        {isAdmin && (
                            <select
                                value={facultyFilter}
                                onChange={(e) => setFacultyFilter(e.target.value)}
                                className={`${selectClass} w-40`}
                                aria-label="Filter by faculty"
                            >
                                <option value="all">All Faculty</option>
                                {facultyOptions.map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        )}

                        <select
                            value={datePreset}
                            onChange={(e) => setDatePreset(e.target.value)}
                            className={`${selectClass} w-36`}
                            aria-label="Filter by date"
                        >
                            {DATE_PRESETS.map(p => (
                                <option key={p.key} value={p.key}>{p.label}</option>
                            ))}
                        </select>

                        {datePreset === "custom" && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className={selectClass}
                                    aria-label="From date"
                                />
                                <span className="text-xs text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className={selectClass}
                                    aria-label="To date"
                                />
                            </div>
                        )}

                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                            className={`${selectClass} w-48`}
                            aria-label="Sort records"
                        >
                            <option value="smart">Live &amp; latest first</option>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="name">Student A-Z</option>
                            <option value="roll">Roll No</option>
                        </select>

                        <div className="flex items-center gap-2 ml-auto">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                                >
                                    <FaTimes className="text-[10px]" /> Clear
                                </button>
                            )}
                            <button
                                onClick={() => { setLoading(true); loadAttendance(sessionFilter); }}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
                                title="Refresh attendance"
                                aria-label="Refresh attendance"
                            >
                                <FaSyncAlt className={`text-slate-400 text-[11px] ${loading ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Status tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {STATUS_TABS.map(tab => {
                                const selected = statusFilter === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setStatusFilter(tab.key)}
                                        className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-full text-xs font-semibold transition ${
                                            selected
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`rounded-full px-1.5 min-w-[20px] text-center text-[10px] font-bold leading-5 ${
                                            selected ? "bg-white/20 text-white" : "bg-white text-slate-500"
                                        }`}>
                                            {statusCounts[tab.key]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <FaFilter className="text-[10px]" />
                            Showing {filteredAttendance.length} of {attendance.length} records
                        </p>
                    </div>
                </div>

                {loading ? <TableSkeleton rows={6} columns={6} /> : (
                    <AttendanceTable
                        key={[statusFilter, subjectFilter, facultyFilter, datePreset, fromDate, toDate, sortMode, search, sessionFilter].join("|")}
                        attendance={filteredAttendance}
                        onDelete={handleDelete}
                        facultyMap={facultyMap}
                        emptyState={
                            attendance.length === 0 ? (
                                <EmptyState
                                    icon={FaClipboardList}
                                    title="No attendance records"
                                    message="Mark attendance or run face recognition to see records here."
                                />
                            ) : (
                                <EmptyState
                                    icon={FaFilter}
                                    title="No records match these filters"
                                    message="Try a different status, date range or search term."
                                    action={
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl text-xs font-bold shadow-sm transition"
                                        >
                                            Clear filters
                                        </button>
                                    }
                                />
                            )
                        }
                    />
                )}
            </div>

            <Modal isOpen={open} title="Manual Attendance" onClose={() => setOpen(false)}>
                <AttendanceForm onSubmit={handleSaveAttendance} loading={saving} />
            </Modal>
            <ConfirmModal isOpen={!!deleteAttendanceData} title="Delete Attendance" message={deleteAttendanceData ? `Delete attendance of ${deleteAttendanceData.student?.name}?` : ""} loading={saving} onClose={() => setDeleteAttendanceData(null)} onConfirm={confirmDelete} />
        </AppLayout>
    );
};

export default Attendance;