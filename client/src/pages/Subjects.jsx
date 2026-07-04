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
import SubjectTable from "../components/SubjectTable";
import SubjectForm from "../components/SubjectForm";

import {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
} from "../services/subjectService";

const Subjects = () => {

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const [editingSubject, setEditingSubject] = useState(null);

    const [deleteSubjectData, setDeleteSubjectData] = useState(null);

    const loadSubjects = async () => {

        try {

            const data = await getSubjects();

            setSubjects(data.subjects);

        }

        catch (err) {

            console.log(err);

            toast.error("Failed to load subjects");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadSubjects();

    }, []);

    const handleSaveSubject = async (subject) => {

        try {

            setSaving(true);

            if (editingSubject) {

                await updateSubject(
                    editingSubject._id,
                    subject
                );

                toast.success("Subject Updated");

            }

            else {

                await createSubject(subject);

                toast.success("Subject Added");

            }

            setOpen(false);

            setEditingSubject(null);

            loadSubjects();

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

    const handleEdit = (subject) => {

        setEditingSubject(subject);

        setOpen(true);

    };

    const handleDelete = (subject) => {

        setDeleteSubjectData(subject);

    };

    const confirmDelete = async () => {

        try {

            setSaving(true);

            await deleteSubject(deleteSubjectData._id);

            toast.success("Subject Deleted");

            setDeleteSubjectData(null);

            loadSubjects();

        }

        catch {

            toast.error("Delete Failed");

        }

        finally {

            setSaving(false);

        }

    };

    const filteredSubjects = subjects.filter((subject) => {

        const text = search.toLowerCase();

        return (

            subject.name.toLowerCase().includes(text)

            ||

            subject.code.toLowerCase().includes(text)

            ||

            subject.faculty.toLowerCase().includes(text)

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

                            Subjects

                        </h1>

                        <RoleGuard roles={["admin"]}>

                            <button

                                onClick={() => {

                                    setEditingSubject(null);

                                    setOpen(true);

                                }}

                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"

                            >

                                + Add Subject

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                        <StatsCard
                            title="Subjects"
                            value={subjects.length}
                            color="text-indigo-600"
                        />

                        <StatsCard
                            title="Semester 5"
                            value={subjects.filter(s => s.semester === 5).length}
                            color="text-green-600"
                        />

                        <StatsCard
                            title="CSE"
                            value={subjects.filter(s => s.branch === "CSE").length}
                            color="text-orange-600"
                        />

                        <StatsCard
                            title="Active"
                            value={subjects.filter(s => s.isActive).length}
                            color="text-blue-600"
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

                            <SubjectTable
                                subjects={filteredSubjects}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                    }

                </div>

            </div>

            <Modal

                isOpen={open}

                title={

                    editingSubject

                        ?

                        "Edit Subject"

                        :

                        "Add Subject"

                }

                onClose={() => {

                    setEditingSubject(null);

                    setOpen(false);

                }}

            >

                <SubjectForm

                    initialData={editingSubject}

                    onSubmit={handleSaveSubject}

                    loading={saving}

                />

            </Modal>

            <ConfirmModal

                isOpen={!!deleteSubjectData}

                title="Delete Subject"

                message={

                    deleteSubjectData

                        ?

                        `Delete ${deleteSubjectData.name}?`

                        :

                        ""

                }

                loading={saving}

                onClose={() => setDeleteSubjectData(null)}

                onConfirm={confirmDelete}

            />

        </div>

    );

};

export default Subjects;