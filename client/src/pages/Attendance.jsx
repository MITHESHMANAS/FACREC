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

const Attendance = () => {

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {

        loadAttendance();

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

                        <RoleGuard roles={["admin","faculty"]}>

                            <button

                                onClick={() => setOpen(true)}

                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"

                            >

                                + Mark Attendance

                            </button>

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

                title="Mark Attendance"

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