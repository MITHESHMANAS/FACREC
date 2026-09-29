import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FaCalendarCheck,
    FaUserCheck,
    FaUserTimes,
    FaPercentage,
    FaListAlt,
    FaFilter,
    FaSyncAlt,
    FaTimes
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/ui/TableSkeleton";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ReportTable, { getPercent, SHORTAGE_LIMIT } from "../components/ReportTable";

import { downloadPdfReport, downloadExcelReport } from "../services/reportService";
import { getSessions } from "../services/sessionService";
import { getFaculty } from "../services/facultyService";
import { useAuth } from "../context/AuthContext";
import useAttendanceSocket from "../hooks/useAttendanceSocket";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
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

const getMonthRange = () => {
    const now = new Date();
    return [
        toLocalISO(new Date(now.getFullYear(), now.getMonth(), 1)),
        toLocalISO(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    ];
};

const stamp = (s) => `${s.date || "0000-00-00"}T${s.startTime || "00:00"}`;

const SORTERS = {
    newest: (a, b) => stamp(b).localeCompare(stamp(a)),
    oldest: (a, b) => stamp(a).localeCompare(stamp(b)),
    lowest: (a, b) => getPercent(a) - getPercent(b),
    highest: (a, b) => getPercent(b) - getPercent(a),
    subject: (a, b) => (a.subject?.name || "").localeCompare(b.subject?.name || "")
};

const BAND_TABS = [
    { key: "all", label: "All" },
    { key: "low", label: `Below ${SHORTAGE_LIMIT}%` },
    { key: "good", label: `${SHORTAGE_LIMIT}% & above` }
];

const DATE_PRESETS = [
    { key: "all", label: "All dates" },
    { key: "today", label: "Today" },
    { key: "week", label: "This week" },
    { key: "month", label: "This month" },
    { key: "custom", label: "Custom range" }
];

const selectClass =
    "h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition";

const safeName = (value) => String(value || "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

const Reports = () => {

    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [sessions, setSessions] = useState([]);
    const [facultyMap, setFacultyMap] = useState({});
    const [loadingSessions, setLoadingSessions] = useState(true);

    // Tracks which specific session + format is downloading, so only
    // that row's button shows a spinner instead of the whole page.
    const [downloadingKey, setDownloadingKey] = useState(null);

    // filters
    const [search, setSearch] = useState("");
    const [bandFilter, setBandFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");
    const [datePreset, setDatePreset] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortMode, setSortMode] = useState("newest");

    const loadSessions = useCallback(async (silent = false) => {

        try {

            if (!silent) setLoadingSessions(true);

            const [data, facultyData] = await Promise.all([
                getSessions(),
                getFaculty().catch(() => [])
            ]);

            const fList = Array.isArray(facultyData) ? facultyData : (facultyData?.faculty || []);
            const fMap = {};
            fList.forEach((f) => { if (f._id) fMap[f._id] = f.name; });

            setFacultyMap(fMap);
            setSessions(data.sessions || []);

        } catch (err) {

            console.error(err);
            toast.error("Unable to load sessions");

        } finally {

            setLoadingSessions(false);

        }

    }, []);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    // A session ending in the Sessions page (or reopened, corrected,
    // and ended again) should make it appear here without the user
    // having to manually refresh the Reports page.
    useAttendanceSocket(null, () => { loadSessions(true); });

    const handleDownload = async (session, format) => {

        const key = `${session._id}-${format}`;
        const base = `Attendance_${safeName(session.subject?.code || session.subject?.name)}_${session.date || "report"}`;

        try {

            setDownloadingKey(key);

            if (format === "pdf") {
                await downloadPdfReport(session._id, `${base}.pdf`);
            } else {
                await downloadExcelReport(session._id, `${base}.xlsx`);
            }

            toast.success(`${format.toUpperCase()} downloaded successfully`);

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.message ||
                err.message ||
                `Unable to generate ${format.toUpperCase()}`
            );

        } finally {

            setDownloadingKey(null);

        }

    };

    // Sessions this user may see reports for (faculty: their own only),
    // with the faculty name resolved once.
    const scopedSessions = useMemo(() => {

        let list = sessions;

        if (user?.role === "faculty") {

            const userId = String(user.id || user._id || "").trim();
            const userName = String(user.name || "").toLowerCase().trim();

            list = sessions.filter((s) => {
                const fid = String(s.faculty || "").trim();
                const fname = String(facultyMap[fid] || "").toLowerCase().trim();
                return fid === userId || fname === userName;
            });
        }

        return list.map((s) => ({ ...s, facultyName: facultyMap[s.faculty] || s.faculty || "" }));

    }, [sessions, facultyMap, user]);

    const endedSessions = useMemo(
        () => scopedSessions.filter((s) => s.status === "ENDED"),
        [scopedSessions]
    );

    const activeSession = scopedSessions.find((s) => s.status === "ACTIVE");

    const subjectOptions = useMemo(() => {
        const map = new Map();
        endedSessions.forEach((s) => {
            if (s.subject?._id) map.set(s.subject._id, s.subject.name);
        });
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [endedSessions]);

    const facultyOptions = useMemo(() => {
        const map = new Map();
        endedSessions.forEach((s) => {
            if (s.faculty) map.set(s.faculty, s.facultyName || s.faculty);
        });
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [endedSessions]);

    // Everything except the attendance-band tab, so tab counts and the
    // KPI cards always describe the same set of sessions.
    const matchesOtherFilters = useCallback((s) => {

        const text = search.trim().toLowerCase();

        if (text) {
            const hit =
                (s.subject?.name || "").toLowerCase().includes(text) ||
                (s.subject?.code || "").toLowerCase().includes(text) ||
                (s.facultyName || "").toLowerCase().includes(text);
            if (!hit) return false;
        }

        if (subjectFilter !== "all" && s.subject?._id !== subjectFilter) return false;
        if (facultyFilter !== "all" && s.faculty !== facultyFilter) return false;

        const date = s.date || "";

        if (datePreset === "today" && date !== toLocalISO(new Date())) return false;
        if (datePreset === "week") {
            const [a, b] = getWeekRange();
            if (date < a || date > b) return false;
        }
        if (datePreset === "month") {
            const [a, b] = getMonthRange();
            if (date < a || date > b) return false;
        }
        if (datePreset === "custom") {
            if (fromDate && date < fromDate) return false;
            if (toDate && date > toDate) return false;
        }

        return true;

    }, [search, subjectFilter, facultyFilter, datePreset, fromDate, toDate]);

    const scopedEnded = useMemo(
        () => endedSessions.filter(matchesOtherFilters),
        [endedSessions, matchesOtherFilters]
    );

    const bandCounts = useMemo(() => ({
        all: scopedEnded.length,
        low: scopedEnded.filter((s) => getPercent(s) < SHORTAGE_LIMIT).length,
        good: scopedEnded.filter((s) => getPercent(s) >= SHORTAGE_LIMIT).length
    }), [scopedEnded]);

    const visibleSessions = useMemo(() => {
        const list = scopedEnded.filter((s) =>
            bandFilter === "all" ||
            (bandFilter === "low" ? getPercent(s) < SHORTAGE_LIMIT : getPercent(s) >= SHORTAGE_LIMIT)
        );
        return [...list].sort(SORTERS[sortMode] || SORTERS.newest);
    }, [scopedEnded, bandFilter, sortMode]);

    const hasActiveFilters =
        search.trim() !== "" ||
        bandFilter !== "all" ||
        subjectFilter !== "all" ||
        facultyFilter !== "all" ||
        datePreset !== "all";

    const clearFilters = () => {
        setSearch("");
        setBandFilter("all");
        setSubjectFilter("all");
        setFacultyFilter("all");
        setDatePreset("all");
        setFromDate("");
        setToDate("");
    };

    // KPIs describe the filtered set (minus the band tab)
    const totalPresent = scopedEnded.reduce((sum, s) => sum + (s.presentStudents || 0), 0);
    const totalAbsent = scopedEnded.reduce((sum, s) => sum + (s.absentStudents || 0), 0);
    const totalExpected = scopedEnded.reduce((sum, s) => sum + (s.expectedStudents || 0), 0);
    const avgPct = totalExpected > 0 ? ((totalPresent / totalExpected) * 100).toFixed(1) : "0.0";

    return (

        <AppLayout>

            <div className="flex flex-col gap-y-6">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
                    <p className="mt-1 text-sm text-slate-500">Download attendance reports for any completed session.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard index={0} title="Sessions" value={scopedEnded.length} icon={FaCalendarCheck} tone="indigo" />
                    <KpiCard index={1} title="Total Present" value={totalPresent} icon={FaUserCheck} tone="emerald" />
                    <KpiCard index={2} title="Total Absent" value={totalAbsent} icon={FaUserTimes} tone="red" />
                    <KpiCard index={3} title="Avg Attendance" value={`${avgPct}%`} icon={FaPercentage} tone="amber" />
                </div>

                {activeSession && (
                    <Card accent="border-l-indigo-600">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Active Session</p>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {activeSession.subject?.name || "Unknown Subject"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeSession.date} &middot; {activeSession.startTime}
                                    {" "}&middot; Expected {activeSession.expectedStudents}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-amber-700 bg-amber-100 px-4 py-2 rounded-lg text-sm font-medium">
                                End this session to generate a report
                            </div>
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
                            placeholder="Search subject or faculty..."
                        />

                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className={`${selectClass} w-44`}
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
                            {DATE_PRESETS.map((p) => (
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
                            className={`${selectClass} w-44`}
                            aria-label="Sort sessions"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="lowest">Lowest attendance</option>
                            <option value="highest">Highest attendance</option>
                            <option value="subject">Subject A-Z</option>
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
                                onClick={() => loadSessions()}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
                                title="Refresh reports"
                                aria-label="Refresh reports"
                            >
                                <FaSyncAlt className={`text-slate-400 text-[11px] ${loadingSessions ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Attendance band tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {BAND_TABS.map((tab) => {
                                const selected = bandFilter === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setBandFilter(tab.key)}
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
                                            {bandCounts[tab.key]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <FaFilter className="text-[10px]" />
                            Showing {visibleSessions.length} of {endedSessions.length} sessions
                        </p>
                    </div>
                </div>

                {/* Table */}
                <Card padding="none" className="overflow-hidden">

                    <div className="p-6 pb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2.5 text-slate-800">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                                <FaListAlt />
                            </span>
                            Completed Sessions
                        </h2>
                    </div>

                    {loadingSessions ? (
                        <TableSkeleton rows={4} columns={6} />
                    ) : (
                        <ReportTable
                            key={[bandFilter, subjectFilter, facultyFilter, datePreset, fromDate, toDate, sortMode, search].join("|")}
                            sessions={visibleSessions}
                            downloadingKey={downloadingKey}
                            onDownload={handleDownload}
                            emptyState={
                                endedSessions.length === 0 ? (
                                    <EmptyState
                                        icon={FaCalendarCheck}
                                        title="No completed sessions yet"
                                        message="Reports become available once a session is started and ended."
                                    />
                                ) : (
                                    <EmptyState
                                        icon={FaFilter}
                                        title="No sessions match these filters"
                                        message="Try a different date range, subject or search term."
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

                </Card>

            </div>

        </AppLayout>

    );

};

export default Reports;