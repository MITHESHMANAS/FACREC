import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";

import AppLayout from "../layouts/AppLayout";
import FacultyTable from "../components/FacultyTable";
import FacultyForm from "../components/FacultyForm";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import {
    FaChalkboardTeacher,
    FaBuilding,
    FaSyncAlt
} from "react-icons/fa";
import KpiCard from "../components/ui/KpiCard";

import {
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty
} from "../services/facultyService";

const Faculty = () => {

    const [faculty, setFaculty] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const [editingFaculty, setEditingFaculty] = useState(null);

    const [deleteFacultyData, setDeleteFacultyData] = useState(null);

    const loadFaculty = async () => {

        try {

            const data = await getFaculty();

            setFaculty(data.faculty);

        }

        catch (err) {

            toast.error("Failed to load faculty");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadFaculty();

    }, []);

    const handleSaveFaculty = async (member) => {

        try {

            setSaving(true);

            if (editingFaculty) {

                await updateFaculty(
                    editingFaculty._id,
                    member
                );

                toast.success("Faculty Updated");

            }

            else {

                await createFaculty(member);

                toast.success("Faculty Added");

            }

            setOpen(false);

            setEditingFaculty(null);

            loadFaculty();

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

    const handleEdit = (member) => {

        setEditingFaculty(member);

        setOpen(true);

    };

    const handleDelete = (member) => {

        setDeleteFacultyData(member);

    };

    const confirmDelete = async () => {

        try {

            setSaving(true);

            await deleteFaculty(deleteFacultyData._id);

            toast.success("Faculty Deleted");

            setDeleteFacultyData(null);

            loadFaculty();

        }

        catch (err) {

            toast.error("Delete Failed");

        }

        finally {

            setSaving(false);

        }

    };

    const [statusFilter, setStatusFilter] = useState("all");

    const filteredFaculty = faculty.filter((f) => {

        const text = search.toLowerCase();

        const matchesSearch = (

            f.name.toLowerCase().includes(text)

            ||

            f.email.toLowerCase().includes(text)

            ||

            f.employeeId.toLowerCase().includes(text)

        );

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" ? f.isActive : !f.isActive);

        return matchesSearch && matchesStatus;

    });

    return (

        <AppLayout>

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-3xl font-semibold tracking-tight">

                            Faculty

                        </h1>

                        <RoleGuard roles={["admin"]}>

                            <button
                                onClick={() => {

                                    setEditingFaculty(null);

                                    setOpen(true);

                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-[14px] font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                            >

                                + Add Faculty

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        <KpiCard
                            index={0}
                            title="Total Faculty"
                            value={faculty.length}
                            icon={FaChalkboardTeacher}
                            tone="indigo"
                        />

                        <KpiCard
                            index={1}
                            title="Branches"
                            value={new Set(faculty.map(f => f.department).filter(Boolean)).size}
                            icon={FaBuilding}
                            tone="slate"
                        />

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                        <div className="flex flex-wrap items-center gap-3">

                            <SearchBar
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email or employee ID..."
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-slate-300 bg-white rounded-[14px] text-sm px-3.5 py-2.5 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                        </div>

                        <button
                            onClick={() => {
                                setLoading(true);
                                loadFaculty();
                            }}
                            className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <FaSyncAlt className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>

                    </div>

                    {

                        loading

                            ?

                            <TableSkeleton rows={5} columns={7} />

                            :

                            <FacultyTable
                                faculty={filteredFaculty}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                    }



            <Modal
                isOpen={open}
                title={editingFaculty ? "Edit Faculty" : "Add Faculty"}
                onClose={() => {

                    setEditingFaculty(null);

                    setOpen(false);

                }}
            >

                <FacultyForm
                    initialData={editingFaculty}
                    onSubmit={handleSaveFaculty}
                    loading={saving}
                />

            </Modal>

            <ConfirmModal
                isOpen={!!deleteFacultyData}
                title="Delete Faculty"
                message={
                    deleteFacultyData
                        ? `Delete ${deleteFacultyData.name}?`
                        : ""
                }
                loading={saving}
                onClose={() => setDeleteFacultyData(null)}
                onConfirm={confirmDelete}
            />

        </AppLayout>

    );

};

export default Faculty;