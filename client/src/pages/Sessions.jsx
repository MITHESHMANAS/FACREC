import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaPlay, FaFlagCheckered, FaClock, FaSyncAlt, FaPlus } from "react-icons/fa";
import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import RoleGuard from "../components/RoleGuard";
import TableSkeleton from "../components/ui/TableSkeleton";
import KpiCard from "../components/ui/KpiCard";
import SessionTable from "../components/SessionTable";
import SessionForm from "../components/SessionForm";
import { useAuth } from "../context/AuthContext";
import { 
    getSessions, createSession, updateSession, 
    startSession, completeSession, reopenSession, deleteSession 
} from "../services/sessionService";
import { getFaculty } from "../services/facultyService";

const Sessions = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [facultyMap, setFacultyMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sessionsRes, facultyRes] = await Promise.all([getSessions(), getFaculty()]);
            setSessions(sessionsRes?.sessions || []);
            const fList = Array.isArray(facultyRes) ? facultyRes : (facultyRes?.faculty || []);
            const fMap = {};
            fList.forEach(f => { const id = f._id || f.id; if (id) fMap[id] = f.name; });
            setFacultyMap(fMap);
        } catch (err) { toast.error("Failed to sync data"); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleAction = async (actionFn, id, successMsg) => {
        try {
            await actionFn(id);
            toast.success(successMsg);
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || "Operation failed"); }
    };

    const filteredSessions = useMemo(() => {
        let list = sessions;

        if (user?.role === 'faculty') {
            const userId = String(user.id || user._id || "").trim();
            const userName = String(user.name || "").toLowerCase().trim();

            list = list.filter(s => {
                const sessionFacultyId = String(s.faculty || "").trim();
                const facultyNameFromMap = String(facultyMap[sessionFacultyId] || "").toLowerCase().trim();
                
                // MATCHING LOGIC:
                // 1. Matches by exact ID
                // 2. Matches by Faculty Name lookup
                // 3. Matches if the raw faculty field string contains the user's name
                return sessionFacultyId === userId || 
                       facultyNameFromMap === userName || 
                       (s.faculty && String(s.faculty).toLowerCase().includes(userName));
            });
        }

        const text = search.toLowerCase();
        return list.filter(s => 
            s.subject?.name?.toLowerCase().includes(text) || 
            (facultyMap[s.faculty] || s.faculty || "").toLowerCase().includes(text)
        );
    }, [sessions, search, facultyMap, user]);

    return (
        <AppLayout>
            <div className="pl-8 pr-8 py-8 flex flex-col gap-8 max-w-[1400px] mx-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sessions</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage, track, and update session status.</p>
                    </div>
                    <RoleGuard roles={["admin"]}>
                        <button onClick={() => { setEditingSession(null); setOpen(true); }} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 h-11 rounded-xl text-xs font-bold shadow-sm transition-all">
                            <FaPlus className="text-[10px]" /> Add Session
                        </button>
                    </RoleGuard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard title="Today's" value={filteredSessions.filter(s => s.date === new Date().toISOString().split("T")[0]).length} icon={FaCalendarAlt} tone="indigo" />
                    <KpiCard title="Active" value={filteredSessions.filter(s => s.status === "ACTIVE").length} icon={FaPlay} tone="emerald" />
                    <KpiCard title="Completed" value={filteredSessions.filter(s => s.status === "ENDED").length} icon={FaFlagCheckered} tone="blue" />
                    <KpiCard title="Upcoming" value={filteredSessions.filter(s => s.status === "SCHEDULED").length} icon={FaClock} tone="amber" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? <TableSkeleton rows={5} columns={4} /> : (
                        <SessionTable 
                            sessions={filteredSessions} 
                            facultyMap={facultyMap}
                            userRole={user?.role}
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
                        setOpen(false); loadData();
                    }} />
                </Modal>
            </RoleGuard>
        </AppLayout>
    );
};

export default Sessions;