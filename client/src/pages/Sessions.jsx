import { useEffect, useState } from "react";
import useAttendanceSocket from "../hooks/useAttendanceSocket";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";

import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import {
    FaCalendarAlt,
    FaPlay,
    FaFlagCheckered,
    FaClock,
    FaSyncAlt
} from "react-icons/fa";
import KpiCard from "../components/ui/KpiCard";
import SessionTable from "../components/SessionTable";
import SessionForm from "../components/SessionForm";

import { useAuth } from "../context/AuthContext";

import {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    completeSession,
    reopenSession
} from "../services/sessionService";
import { getMySubjects } from "../services/facultySubjectService";

const Sessions = () => {

    const { user } = useAuth();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const [editingSession, setEditingSession] = useState(null);

    const [deleteSessionData, setDeleteSessionData] = useState(null);

    // For faculty accounts, restrict the sessions list to the subjects
    // they're actually assigned to - "My Subjects" instead of every
    // session in the system.
    const [mySubjectIds, setMySubjectIds] = useState(null);

    const loadMySubjects = async () => {

        if (user?.role !== "faculty") {
            return;
        }

        try {

            const data = await getMySubjects();
            setMySubjectIds(
                data.subjects.map((s) => s._id)
            );

        } catch {

            // No linked faculty profile yet, or no assignments -
            // fall back to an empty list rather than showing everything.
            setMySubjectIds([]);

        }

    };

    const loadSessions = async () => {

        try {

            const data = await getSessions();

            setSessions(data.sessions);

        }

        catch {

            toast.error("Failed to load sessions");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadSessions();
        loadMySubjects();

        }, [user]);

    // Another tab/faculty member ending, reopening, or starting a
    // session should be reflected here too, not just in the tab that
    // triggered it.
    useAttendanceSocket(null, () => {

        loadSessions();

    });

    const handleStart = async (session) => {

        try {

            await startSession(session._id);

            toast.success("Session Started");

            loadSessions();

        }

        catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to start session"
            );

        }

    };

    const handleComplete = async (session) => {

        try {

            await completeSession(session._id);

            toast.success("Session Ended");

            loadSessions();

        }

        catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to end session"
            );

        }

    };

    const handleReopen = async (session) => {

        try {

            await reopenSession(session._id);

            toast.success("Session Reopened");

            loadSessions();

        }

        catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to reopen session"
            );

        }

    };

    const handleSaveSession = async (session) => {

        try {

            setSaving(true);

            if (editingSession) {

                await updateSession(
                    editingSession._id,
                    session
                );

                toast.success("Session Updated");

            }

            else {

                await createSession(session);

                toast.success("Session Created");

            }

            setEditingSession(null);

            setOpen(false);

            loadSessions();

        }

        catch (err) {

            console.log(err);

            toast.error(

                err.response?.data?.message ||

                err.message ||

                "Operation Failed"

            );

        }

        finally {

            setSaving(false);

        }

    };

    const handleEdit = (session) => {

        setEditingSession(session);

        setOpen(true);

    };

    const handleDelete = (session) => {

        setDeleteSessionData(session);

    };

    const confirmDelete = async () => {

        try {

            setSaving(true);

            await deleteSession(deleteSessionData._id);

            toast.success("Session Deleted");

            setDeleteSessionData(null);

            loadSessions();

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                "Delete Failed"

            );

        }

        finally {

            setSaving(false);

        }

    };

    const scopedSessions =
        user?.role === "faculty" && mySubjectIds
            ? sessions.filter((s) =>
                mySubjectIds.includes(s.subject?._id)
            )
            : sessions;

    const filteredSessions = scopedSessions.filter((session) => {

        const text = search.toLowerCase();

        return (

            session.subject?.name?.toLowerCase().includes(text)

            ||

            session.faculty?.toLowerCase().includes(text)

            ||

            session.branch?.toLowerCase().includes(text)

        );

    });

    return (

        <AppLayout>

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-3xl font-semibold tracking-tight">

                            Sessions

                        </h1>

                        <RoleGuard roles={["admin"]}>

                            <button
                                onClick={() => {

                                    setEditingSession(null);

                                    setOpen(true);

                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-[14px] font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                            >

                                + Create Session

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

                        <KpiCard
                            index={0}
                            title="Today's Sessions"
                            value={
                                scopedSessions.filter(
                                    s => s.date === new Date().toISOString().split("T")[0]
                                ).length
                            }
                            icon={FaCalendarAlt}
                            tone="indigo"
                        />

                        <KpiCard
                            index={1}
                            title="Active"
                            value={
                                scopedSessions.filter(
                                    s => s.status === "ACTIVE"
                                ).length
                            }
                            icon={FaPlay}
                            tone="emerald"
                        />

                        <KpiCard
                            index={2}
                            title="Completed"
                            value={
                                scopedSessions.filter(
                                    s => s.status === "ENDED"
                                ).length
                            }
                            icon={FaFlagCheckered}
                            tone="blue"
                        />

                        <KpiCard
                            index={3}
                            title="Upcoming"
                            value={
                                scopedSessions.filter(
                                    s => s.status === "SCHEDULED"
                                ).length
                            }
                            icon={FaClock}
                            tone="amber"
                        />

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                        <SearchBar
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by subject, faculty or branch..."
                        />

                        <button
                            onClick={() => {
                                setLoading(true);
                                loadSessions();
                            }}
                            className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <FaSyncAlt className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>

                    </div>

                    {

                        loading ?

                            <TableSkeleton rows={5} columns={6} />

                            :

                            <SessionTable
                                sessions={filteredSessions}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onStart={handleStart}
                                onComplete={handleComplete}
                                onReopen={handleReopen}
                            />

                    }



            <Modal
                isOpen={open}
                title={
                    editingSession
                        ? "Edit Session"
                        : "Create Session"
                }
                onClose={() => {

                    setEditingSession(null);

                    setOpen(false);

                }}
            >

                <SessionForm
                    initialData={editingSession}
                    onSubmit={handleSaveSession}
                    loading={saving}
                />

            </Modal>

            <ConfirmModal
                isOpen={!!deleteSessionData}
                title="Delete Session"
                message={
                    deleteSessionData
                        ? `Delete ${deleteSessionData.subject?.name} session?`
                        : ""
                }
                loading={saving}
                onClose={() => setDeleteSessionData(null)}
                onConfirm={confirmDelete}
            />

        </AppLayout>

    );

};

export default Sessions;