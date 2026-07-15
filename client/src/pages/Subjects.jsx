import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CardSkeleton from "../components/ui/CardSkeleton";

import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import RoleGuard from "../components/RoleGuard";
import {
    FaBook,
    FaBuilding,
    FaUserTie,
    FaSyncAlt
} from "react-icons/fa";
import KpiCard from "../components/ui/KpiCard";
import EmptyState from "../components/ui/EmptyState";
import SubjectCard from "../components/SubjectCard";
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

        <AppLayout>

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-3xl font-semibold tracking-tight">

                            Subjects

                        </h1>

                        <RoleGuard roles={["admin"]}>

                            <button

                                onClick={() => {

                                    setEditingSubject(null);

                                    setOpen(true);

                                }}

                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-[14px] font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"

                            >

                                + Add Subject

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                        <KpiCard
                            index={0}
                            title="Subjects"
                            value={subjects.length}
                            icon={FaBook}
                            tone="indigo"
                        />

                        <KpiCard
                            index={1}
                            title="Faculty Assigned"
                            value={subjects.filter(s => s.faculty).length}
                            icon={FaUserTie}
                            tone="amber"
                        />

                        <KpiCard
                            index={2}
                            title="Branches"
                            value={new Set(subjects.map(s => s.branch).filter(Boolean)).size}
                            icon={FaBuilding}
                            tone="slate"
                        />

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                        <SearchBar
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code, name or faculty..."
                        />

                        <button
                            onClick={() => {
                                setLoading(true);
                                loadSubjects();
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

                            <CardSkeleton cards={6} />

                            :

                            filteredSubjects.length === 0

                                ?

                                <EmptyState
                                    icon={FaBook}
                                    title="No Subjects Found"
                                    message="Add your first subject."
                                />

                                :

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                                    {filteredSubjects.map((subject) => (

                                        <SubjectCard
                                            key={subject._id}
                                            subject={subject}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />

                                    ))}

                                </div>

                    }



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

        </AppLayout>

    );

};

export default Subjects;