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
import AttendanceTable from "../components/AttendanceTable";
import AttendanceForm from "../components/AttendanceForm";

import {
    getAttendance,
    markAttendance,
    deleteAttendance
} from "../services/attendanceService";

import {
    startRecognition
} from "../services/recognitionService";

import { getSessions } from "../services/sessionService";

const Attendance = () => {

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [recognizing, setRecognizing] = useState(false);
    const [recognizedStudents, setRecognizedStudents] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const [deleteAttendanceData, setDeleteAttendanceData] = useState(null);

    const loadAttendance = async () => {

        try {

            const data = await getAttendance();

            setAttendance(data.attendance);

        }

        catch (err) {

            toast.error("Failed to load attendance");

        }

        finally {

            setLoading(false);

        }

    };

    const loadActiveSession = async () => {

        try {

            const data = await getSessions();

            const active = data.sessions.find(

                session => session.status === "ACTIVE"

            );

            setActiveSession(active || null);

        }

        catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        loadAttendance();

        loadActiveSession();

    }, []);

    const handleSaveAttendance = async (record) => {

        try {

            setSaving(true);

            await markAttendance(record);

            toast.success("Attendance Marked");

            setOpen(false);

            loadAttendance();

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

    const handleRecognition = async () => {

        if (!activeSession) {

            toast.error(

                "Please start a session first."

            );

            return;

        }

        try {

            setRecognizing(true);

            toast.loading(
                "Starting Face Recognition...",
                {
                    id: "recognition"
                }
            );

            const result = await startRecognition();

            toast.dismiss("recognition");

            toast.success(
                `${result.total} student(s) recognized`
            );

            setRecognizedStudents(
                result.recognized || []
            );

            await loadAttendance();

        }

        catch (err) {

            toast.dismiss("recognition");

            toast.error(

                err.response?.data?.message ||

                "Recognition Failed"

            );

        }

        finally {

            setRecognizing(false);

        }

    };

    const handleDelete = (record) => {

        setDeleteAttendanceData(record);

    };

    const confirmDelete = async () => {

        try {

            setSaving(true);

            await deleteAttendance(deleteAttendanceData._id);

            toast.success("Attendance Deleted");

            setDeleteAttendanceData(null);

            loadAttendance();

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

    const filteredAttendance = attendance.filter((record) => {

        const text = search.toLowerCase();

        return (

            record.student?.name?.toLowerCase().includes(text)

            ||

            record.student?.rollNo?.toLowerCase().includes(text)

            ||

            record.session?.subject?.name?.toLowerCase().includes(text)

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

                            Attendance

                        </h1>

                        <RoleGuard roles={["admin", "faculty"]}>

                            <div className="flex gap-3">

                                <button

                                    onClick={handleRecognition}

                                    disabled={recognizing || !activeSession}

                                    className={`text-white px-5 py-2 rounded-lg
                                    ${
                                        activeSession
                                            ?
                                            "bg-green-600 hover:bg-green-700"
                                            :
                                            "bg-gray-400 cursor-not-allowed"
                                    }`}

                                >

                                    {

                                        activeSession

                                            ?

                                            "🎥 Start Face Recognition"

                                            :

                                            "No Active Session"

                                    }

                                </button>

                                <button

                                    onClick={() => setOpen(true)}

                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"

                                tactics>

                                    Manual Attendance

                                </button>

                            </div>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                        <StatsCard
                            title="Records"
                            value={attendance.length}
                            color="text-indigo-600"
                        />

                        <StatsCard
                            title="Present"
                            value={
                                attendance.filter(
                                    a => a.status === "Present"
                                ).length
                            }
                            color="text-green-600"
                        />

                        <StatsCard
                            title="Absent"
                            value={
                                attendance.filter(
                                    a => a.status === "Absent"
                                ).length
                            }
                            color="text-red-600"
                        />

                        <StatsCard
                            title="Students"
                            value={
                                new Set(
                                    attendance.map(
                                        a => a.student?._id
                                    )
                                ).size
                            }
                            color="text-orange-600"
                        />

                    </div>

                    {

                        activeSession ? (

                            <div className="bg-green-50 border border-green-300 rounded-xl shadow-sm p-6 mb-6">

                                <div className="flex justify-between items-center">

                                    <div>

                                        <h2 className="text-2xl font-bold text-green-700">

                                            🟢 Active Session

                                        </h2>

                                        <p className="mt-3">

                                            <strong>Subject:</strong>{" "}

                                            {activeSession.subject?.name}

                                        </p>

                                        <p>

                                            <strong>Faculty:</strong>{" "}

                                            {activeSession.faculty}

                                        </p>

                                        <p>

                                            <strong>Semester:</strong>{" "}

                                            {activeSession.semester}

                                        </p>

                                        <p>

                                            <strong>Branch:</strong>{" "}

                                            {activeSession.branch}

                                        </p>

                                    </div>

                                    <div>

                                        <span className="bg-green-600 text-white px-4 py-2 rounded-full">

                                            ACTIVE

                                        </span>

                                    </div>

                                </div>

                            </div>

                        ) : (

                            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-6">

                                <h2 className="text-xl font-bold text-yellow-700">

                                    ⚠ No Active Session

                                </h2>

                                <p className="mt-2">

                                    Start a session before beginning face recognition.

                                </p>

                            </div>

                        )

                    }

                    {

                        recognizedStudents.length > 0 && (

                            <div className="bg-white rounded-xl shadow p-5 mb-6">

                                <h2 className="text-xl font-semibold mb-4">

                                    Recognition Results

                                </h2>

                                {

                                    recognizedStudents.map((student) => (

                                        <div

                                            key={student.name}

                                            className="flex justify-between border-b py-3"

                                        >

                                            <div>

                                                <p className="font-medium">

                                                    ✅ {student.name}

                                                </p>

                                                <p className="text-sm text-gray-500">

                                                    {student.subject}

                                                </p>

                                            </div>

                                            <div className="text-right">

                                                <p className="text-green-600 font-semibold">

                                                    {student.status}

                                                </p>

                                                <p className="text-xs text-gray-500">

                                                    {student.confidence}%

                                                </p>

                                            </div>

                                        </div>

                                    ))

                                }

                            </div>

                        )

                    }

                    <div className="mb-6">

                        <SearchBar

                            value={search}

                            onChange={(e) =>
                                setSearch(e.target.value)
                            }

                        />

                    </div>

                    {

                        loading

                            ?

                            <div className="flex justify-center py-16">

                                <BeatLoader color="#4f46e5" />

                            </div>

                            :

                            <AttendanceTable

                                attendance={filteredAttendance}

                                onDelete={handleDelete}

                            />

                    }

                </div>

            </div>

            <Modal

                isOpen={open}

                title="Manual Attendance"

                onClose={() => setOpen(false)}

            >

                <AttendanceForm

                    onSubmit={handleSaveAttendance}

                    loading={saving}

                />

            </Modal>

            <ConfirmModal

                isOpen={!!deleteAttendanceData}

                title="Delete Attendance"

                message={

                    deleteAttendanceData

                        ?

                        `Delete attendance of ${deleteAttendanceData.student?.name}?`

                        :

                        ""

                }

                loading={saving}

                onClose={() => setDeleteAttendanceData(null)}

                onConfirm={confirmDelete}

            />

        </div>

    );

};

export default Attendance;