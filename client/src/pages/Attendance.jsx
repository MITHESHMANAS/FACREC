import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import {
    FaVideo, FaPlus, FaClipboardList, FaUserCheck, FaUserTimes,
    FaUserGraduate, FaCircle, FaExclamationTriangle, FaCheckCircle,
    FaFilter, FaSyncAlt
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormSelect from "../components/ui/FormSelect";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceForm from "../components/AttendanceForm";

import { getAttendance, markAttendance, deleteAttendance } from "../services/attendanceService";
import { startRecognition } from "../services/recognitionService";
import { getSessions } from "../services/sessionService";
import { getFaculty } from "../services/facultyService";
import useAttendanceSocket from "../hooks/useAttendanceSocket";

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
    const [open, setOpen] = useState(false);
    const [deleteAttendanceData, setDeleteAttendanceData] = useState(null);

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

            const sorted = [...(sessionData.sessions || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    const filteredAttendance = attendance.filter((r) => {
        const text = search.toLowerCase();
        return r.student?.name?.toLowerCase().includes(text) || r.student?.rollNo?.toLowerCase().includes(text) || r.session?.subject?.name?.toLowerCase().includes(text);
    });

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

                <div className="w-full max-w-lg">
                    <FormSelect label="Showing attendance for" icon={FaFilter} value={sessionFilter ?? ""} onChange={(e) => setSessionFilter(e.target.value)}>
                        <option value="">All Sessions (history)</option>
                        {allSessions.map((session) => (
                            <option key={session._id} value={session._id}>
                                {session.subject?.code} - {session.subject?.name} ({session.date}) {session.status === "ACTIVE" ? " ← current" : ""}
                            </option>
                        ))}
                    </FormSelect>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard index={0} title="Records" value={attendance.length} icon={FaClipboardList} tone="indigo" />
                    <KpiCard index={1} title="Present" value={attendance.filter(a => a.status === "Present").length} icon={FaUserCheck} tone="emerald" />
                    <KpiCard index={2} title="Absent" value={attendance.filter(a => a.status === "Absent").length} icon={FaUserTimes} tone="red" />
                    <KpiCard index={3} title="Students" value={new Set(attendance.map(a => a.student?._id)).size} icon={FaUserGraduate} tone="amber" />
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

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, roll no or subject..." />
                    <button onClick={() => loadAttendance(sessionFilter)} className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all">
                        <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {loading ? <TableSkeleton rows={6} columns={6} /> : (
                    <AttendanceTable 
                        attendance={filteredAttendance} 
                        onDelete={handleDelete} 
                        facultyMap={facultyMap} 
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