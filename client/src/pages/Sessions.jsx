import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import StatsCard from "../components/StatsCard";
import SessionTable from "../components/SessionTable";
import SessionForm from "../components/SessionForm";

import {
    getSessions,
    createSession,
    updateSession,
    deleteSession
} from "../services/sessionService";

const Sessions = () => {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const [editingSession, setEditingSession] = useState(null);

    const [deleteSessionData, setDeleteSessionData] = useState(null);

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

    }, []);

    const handleSaveSession = async (session) => {

        try {

            setSaving(true);

            if (editingSession) {

                await updateSession(editingSession._id, session);

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

            toast.error(

                err.response?.data?.message ||

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

            await deleteSession(deleteSessionData._id);

            toast.success("Session Deleted");

            setDeleteSessionData(null);

            loadSessions();

        }

        catch {

            toast.error("Delete Failed");

        }

    };

    const filteredSessions = sessions.filter((session) => {

        const text = search.toLowerCase();

        return (

            session.subject?.name.toLowerCase().includes(text)

            ||

            session.faculty.toLowerCase().includes(text)

            ||

            session.branch.toLowerCase().includes(text)

        );

    });

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <div className="p-8">

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-3xl font-bold">

                            Sessions

                        </h1>

                        <RoleGuard roles={["admin"]}>

                            <button

                                onClick={() => {

                                    setEditingSession(null);

                                    setOpen(true);

                                }}

                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"

                            >

                                + Create Session

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                        <StatsCard
                            title="Total"
                            value={sessions.length}
                            color="text-indigo-600"
                        />

                        <StatsCard
                            title="Active"
                            value={sessions.filter(s => s.status === "ACTIVE").length}
                            color="text-green-600"
                        />

                        <StatsCard
                            title="Completed"
                            value={sessions.filter(s => s.status === "COMPLETED").length}
                            color="text-orange-600"
                        />

                        <StatsCard
                            title="Scheduled"
                            value={sessions.filter(s => s.status === "SCHEDULED").length}
                            color="text-red-600"
                        />

                    </div>

                    <div className="mb-6">

                        <SearchBar
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                    </div>

                    {

                        loading

                            ?

                            <div className="flex justify-center py-16">

                                <BeatLoader color="#4f46e5"/>

                            </div>

                            :

                            <SessionTable
                                sessions={filteredSessions}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                    }

                </div>

            </div>

            <Modal
                isOpen={open}
                title={editingSession ? "Edit Session" : "Create Session"}
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
                onClose={() => setDeleteSessionData(null)}
                onConfirm={confirmDelete}
                loading={saving}
            />

        </div>

    );

};

export default Sessions;