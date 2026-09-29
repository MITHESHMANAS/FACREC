import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FaCalendarAlt,
    FaPlay,
    FaFlagCheckered,
    FaClock,
    FaSyncAlt,
    FaPlus,
    FaTimes,
    FaFilter
} from "react-icons/fa";
import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import RoleGuard from "../components/RoleGuard";
import TableSkeleton from "../components/ui/TableSkeleton";
import KpiCard from "../components/ui/KpiCard";
import EmptyState from "../components/ui/EmptyState";
import SessionTable from "../components/SessionTable";
import SessionForm from "../components/SessionForm";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import {
    getSessions, createSession, updateSession,
    startSession, completeSession, reopenSession, deleteSession
} from "../services/sessionService";
import { getFaculty } from "../services/facultyService";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

// Local calendar date (YYYY-MM-DD). toISOString() would give the UTC date,
// which is "yesterday" for the first hours of the day in India.
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

// "2026-07-15T09:30" - plain string comparison sorts chronologically.
const stamp = (s) => `${s.date || "0000-00-00"}T${s.startTime || "00:00"}`;

const STATUS_RANK = { ACTIVE: 0, SCHEDULED: 1, ENDED: 2 };

const SORTERS = {
    // Live session first, then what's coming up next (soonest first),
    // then history (most recent first).
    smart: (a, b) => {
        const ra = STATUS_RANK[a.status] ?? 3;
        const rb = STATUS_RANK[b.status] ?? 3;
        if (ra !== rb) return ra - rb;

        if (a.status === "SCHEDULED") return stamp(a).localeCompare(stamp(b));
        return stamp(b).localeCompare(stamp(a));
    },
    newest: (a, b) => stamp(b).localeCompare(stamp(a)),
    oldest: (a, b) => stamp(a).localeCompare(stamp(b))
};

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "ACTIVE", label: "Active" },
    { key: "SCHEDULED", label: "Scheduled" },
    { key: "ENDED", label: "Ended" }
];

const DATE_PRESETS = [
    { key: "all", label: "All dates" },
    { key: "today", label: "Today" },
    { key: "week", label: "This week" },
    { key: "upcoming", label: "Today onwards" },
    { key: "past", label: "Before today" },
    { key: "custom", label: "Custom range" }
];

const selectClass =
    "h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition";

const dateInputClass =
    "h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition";

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

const Sessions = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [sessions, setSessions] = useState([]);
    const [facultyMap, setFacultyMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    // filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");
    const [datePreset, setDatePreset] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortMode, setSortMode] = useState("smart");

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [sessionsRes, facultyRes] = await Promise.all([getSessions(), getFaculty()]);
            setSessions(sessionsRes?.sessions || []);
            const fList = Array.isArray(facultyRes) ? facultyRes : (facultyRes?.faculty || []);
            const fMap = {};
            fList.forEach(f => { const id = f._id || f.id; if (id) fMap[id] = f.name; });
            setFacultyMap(fMap);
        } catch (err) { toast.error("Failed to sync data"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Another user (or the recognition flow) started/ended a session:
    // refresh quietly so the live session jumps to the top by itself.
    useEffect(() => {
        const refresh = () => loadData(true);
        socket.on("sessionUpdated", refresh);
        return () => socket.off("sessionUpdated", refresh);
    }, [loadData]);

    const handleAction = async (actionFn, id, successMsg) => {
        try {
            await actionFn(id);
            toast.success(successMsg);
            loadData(true);
        } catch (err) { toast.error(err.response?.data?.message || "Operation failed"); }
    };

    // Sessions this user is allowed to see (faculty only see their own).
    const scopedSessions = useMemo(() => {
        if (user?.role !== "faculty") return sessions;

        const userId = String(user.id || user._id || "").trim();
        const userName = String(user.name || "").toLowerCase().trim();

        return sessions.filter(s => {
            const sessionFacultyId = String(s.faculty || "").trim();
            const facultyNameFromMap = String(facultyMap[sessionFacultyId] || "").toLowerCase().trim();

            return sessionFacultyId === userId ||
                facultyNameFromMap === userName ||
                (s.faculty && String(s.faculty).toLowerCase().includes(userName));
        });
    }, [sessions, facultyMap, user]);

    // dropdown options come from the data itself
    const subjectOptions = useMemo(() => {
        const map = new Map();
        scopedSessions.forEach(s => {
            if (s.subject?._id) map.set(s.subject._id, s.subject.name);
        });
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [scopedSessions]);

    const facultyOptions = useMemo(() => {
        const map = new Map();
        scopedSessions.forEach(s => {
            if (s.faculty) map.set(s.faculty, facultyMap[s.faculty] || s.faculty);
        });
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [scopedSessions, facultyMap]);

    // Everything except the status tab, so each tab's count reflects
    // the other filters currently applied.
    const matchesOtherFilters = useCallback((s) => {
        const text = search.trim().toLowerCase();

        if (text) {
            const hit =
                s.subject?.name?.toLowerCase().includes(text) ||
                (facultyMap[s.faculty] || s.faculty || "").toLowerCase().includes(text);
            if (!hit) return false;
        }

        if (subjectFilter !== "all" && s.subject?._id !== subjectFilter) return false;
        if (facultyFilter !== "all" && s.faculty !== facultyFilter) return false;

        const today = toLocalISO(new Date());
        const date = s.date || "";

        if (datePreset === "today" && date !== today) return false;
        if (datePreset === "upcoming" && date < today) return false;
        if (datePreset === "past" && date >= today) return false;
        if (datePreset === "week") {
            const [start, end] = getWeekRange();
            if (date < start || date > end) return false;
        }
        if (datePreset === "custom") {
            if (fromDate && date < fromDate) return false;
            if (toDate && date > toDate) return false;
        }

        return true;
    }, [search, subjectFilter, facultyFilter, datePreset, fromDate, toDate, facultyMap]);

    const statusCounts = useMemo(() => {
        const counts = { all: 0, ACTIVE: 0, SCHEDULED: 0, ENDED: 0 };
        scopedSessions.forEach(s => {
            if (!matchesOtherFilters(s)) return;
            counts.all++;
            if (counts[s.status] !== undefined) counts[s.status]++;
        });
        return counts;
    }, [scopedSessions, matchesOtherFilters]);

    const visibleSessions = useMemo(() => {
        const list = scopedSessions.filter(s =>
            matchesOtherFilters(s) && (statusFilter === "all" || s.status === statusFilter)
        );
        return [...list].sort(SORTERS[sortMode] || SORTERS.smart);
    }, [scopedSessions, matchesOtherFilters, statusFilter, sortMode]);

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

    // KPIs describe the user's whole schedule, independent of the filters.
    const today = toLocalISO(new Date());
    const kpi = {
        today: scopedSessions.filter(s => s.date === today).length,
        active: scopedSessions.filter(s => s.status === "ACTIVE").length,
        ended: scopedSessions.filter(s => s.status === "ENDED").length,
        scheduled: scopedSessions.filter(s => s.status === "SCHEDULED").length
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-y-6">

                {/* Heading */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sessions</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage, track, and update session status.</p>
                    </div>
                    <RoleGuard roles={["admin"]}>
                        <button
                            onClick={() => { setEditingSession(null); setOpen(true); }}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaPlus className="text-[10px]" /> Add Session
                        </button>
                    </RoleGuard>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard index={0} title="Today's" value={kpi.today} icon={FaCalendarAlt} tone="indigo" />
                    <KpiCard index={1} title="Active" value={kpi.active} icon={FaPlay} tone="emerald" />
                    <KpiCard index={2} title="Completed" value={kpi.ended} icon={FaFlagCheckered} tone="blue" />
                    <KpiCard index={3} title="Upcoming" value={kpi.scheduled} icon={FaClock} tone="amber" />
                </div>

                {/* Filter toolbar */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">

                    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                        <SearchBar
                            className="max-w-[320px] flex-1 min-w-[200px]"
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
                                    className={dateInputClass}
                                    aria-label="From date"
                                />
                                <span className="text-xs text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className={dateInputClass}
                                    aria-label="To date"
                                />
                            </div>
                        )}

                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                            className={`${selectClass} w-40`}
                            aria-label="Sort sessions"
                        >
                            <option value="smart">Live &amp; next first</option>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
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
                                onClick={() => loadData()}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
                                title="Refresh sessions"
                                aria-label="Refresh sessions"
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
                                const count = statusCounts[tab.key] ?? 0;

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
                                        {tab.key === "ACTIVE" && count > 0 && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>
                                        )}
                                        {tab.label}
                                        <span className={`rounded-full px-1.5 min-w-[20px] text-center text-[10px] font-bold leading-5 ${
                                            selected ? "bg-white/20 text-white" : "bg-white text-slate-500"
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <FaFilter className="text-[10px]" />
                            Showing {visibleSessions.length} of {scopedSessions.length} sessions
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? <TableSkeleton rows={5} columns={5} /> : (
                        <SessionTable
                            sessions={visibleSessions}
                            facultyMap={facultyMap}
                            userRole={user?.role}
                            emptyState={
                                scopedSessions.length === 0 ? (
                                    <EmptyState
                                        icon={FaCalendarAlt}
                                        title="No sessions yet"
                                        message="Sessions you schedule will appear here."
                                    />
                                ) : (
                                    <EmptyState
                                        icon={FaFilter}
                                        title="No sessions match these filters"
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
                            onEdit={(s) => { setEditingSession(s); setOpen(true); }}
                            onDelete={(s) => handleAction(deleteSession, s._id, "Session Deleted")}
                            onStart={(s) => handleAction(startSession, s._id, "Session Started")}
                            onComplete={(s) => handleAction(completeSession, s._id, "Session Ended")}
                            onReopen={(s) => handleAction(reopenSession, s._id, "Session Reopened")}
                        />
                    )}
                </div>
            </div>

            <RoleGuard roles={["admin"]}>
                <Modal isOpen={open} title={editingSession ? "Edit Session" : "Create Session"} onClose={() => { setEditingSession(null); setOpen(false); }}>
                    <SessionForm initialData={editingSession} onSubmit={async (data) => {
                        editingSession ? await updateSession(editingSession._id, data) : await createSession(data);
                        setOpen(false); loadData(true);
                    }} />
                </Modal>
            </RoleGuard>
        </AppLayout>
    );
};

export default Sessions;