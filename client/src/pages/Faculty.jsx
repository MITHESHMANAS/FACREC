import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FacultyTable from "../components/FacultyTable";
import FacultyForm from "../components/FacultyForm";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import StatsCard from "../components/StatsCard";

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

    const filteredFaculty = faculty.filter((f) => {

        const text = search.toLowerCase();

        return (

            f.name.toLowerCase().includes(text)

            ||

            f.email.toLowerCase().includes(text)

            ||

            f.employeeId.toLowerCase().includes(text)

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

                            Faculty

                        </h1>

                        <RoleGuard roles={["admin"]}>

                            <button
                                onClick={() => {

                                    setEditingFaculty(null);

                                    setOpen(true);

                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
                            >

                                + Add Faculty

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                        <StatsCard
                            title="Faculty"
                            value={faculty.length}
                            color="text-indigo-600"
                        />

                        <StatsCard
                            title="CSE"
                            value={faculty.filter(f => f.department === "CSE").length}
                            color="text-green-600"
                        />

                        <StatsCard
                            title="ECE"
                            value={faculty.filter(f => f.department === "ECE").length}
                            color="text-orange-600"
                        />

                        <StatsCard
                            title="ME"
                            value={faculty.filter(f => f.department === "ME").length}
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

                                <BeatLoader
                                    color="#4f46e5"
                                />

                            </div>

                            :

                            <FacultyTable
                                faculty={filteredFaculty}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                    }

                </div>

            </div>

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

        </div>

    );

};

export default Faculty;