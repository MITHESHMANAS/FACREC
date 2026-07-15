import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";

import AppLayout from "../layouts/AppLayout";
import StudentTable from "../components/StudentTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import StudentForm from "../components/StudentForm";
import RoleGuard from "../components/RoleGuard";
import {
    FaUserGraduate,
    FaCheckCircle,
    FaBuilding,
    FaLayerGroup,
    FaSyncAlt
} from "react-icons/fa";
import KpiCard from "../components/ui/KpiCard";

import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent
} from "../services/studentService";

const Students = () => {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const [editingStudent, setEditingStudent] = useState(null);

    const [deleteStudentData, setDeleteStudentData] = useState(null);

    const loadStudents = async () => {

        try {

            const data = await getStudents();

            setStudents(data.students);

        }

        catch {

            toast.error("Failed to load students");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadStudents();

    }, []);

    const handleSaveStudent = async (student) => {

        try {

            setSaving(true);

            if (editingStudent) {

                await updateStudent(
                    editingStudent._id,
                    student
                );

                toast.success("Student Updated");

            }

            else {

                await createStudent(student);

                toast.success("Student Added");

            }

            setOpen(false);

            setEditingStudent(null);

            loadStudents();

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

    const handleEdit = (student) => {

        setEditingStudent(student);

        setOpen(true);

    };

    const handleDelete = (student) => {

        setDeleteStudentData(student);

    };

    const confirmDelete = async () => {

        try {

            setSaving(true);

            await deleteStudent(deleteStudentData._id);

            toast.success("Student Deleted");

            setDeleteStudentData(null);

            loadStudents();

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

    const [statusFilter, setStatusFilter] = useState("all");

    const filteredStudents = students.filter((student) => {

        const text = search.toLowerCase();

        const matchesSearch = (

            student.name.toLowerCase().includes(text) ||

            student.rollNo.toLowerCase().includes(text) ||

            student.email.toLowerCase().includes(text)

        );

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" ? student.isActive : !student.isActive);

        return matchesSearch && matchesStatus;

    });

    return (

        <AppLayout>

                    <div className="flex justify-between items-center mb-6">

                        <div>

                            <h1 className="text-3xl font-semibold tracking-tight">

                                Students

                            </h1>

                            <p className="text-gray-500 mt-1">

                                Manage student records and profiles

                            </p>

                        </div>

                        <RoleGuard roles={["admin"]}>

                            <button

                                onClick={() => {

                                    setEditingStudent(null);

                                    setOpen(true);

                                }}

                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-[14px] font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"

                            >

                                + Add Student

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

                        <KpiCard
                            index={0}
                            title="Total Students"
                            value={students.length}
                            icon={FaUserGraduate}
                            tone="indigo"
                        />

                        <KpiCard
                            index={1}
                            title="Active Students"
                            value={students.filter(s => s.isActive).length}
                            icon={FaCheckCircle}
                            tone="emerald"
                        />

                        <KpiCard
                            index={2}
                            title="Branches"
                            value={new Set(students.map(s => s.branch).filter(Boolean)).size}
                            icon={FaBuilding}
                            tone="slate"
                        />

                        <KpiCard
                            index={3}
                            title="Semesters"
                            value={new Set(students.map(s => s.semester).filter(Boolean)).size}
                            icon={FaLayerGroup}
                            tone="amber"
                        />

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                        <div className="flex flex-wrap items-center gap-3">

                            <SearchBar

                                value={search}

                                onChange={(e) => setSearch(e.target.value)}

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
                                loadStudents();
                            }}
                            className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <FaSyncAlt className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>

                    </div>

                    {

                        loading ?

                            <TableSkeleton rows={6} columns={8} />

                            :

                            <StudentTable

                                students={filteredStudents}

                                onEdit={handleEdit}

                                onDelete={handleDelete}

                            />

                    }



            <Modal

                isOpen={open}

                title={editingStudent ? "Edit Student" : "Add Student"}

                onClose={() => {

                    setEditingStudent(null);

                    setOpen(false);

                }}

            >

                <StudentForm

                    initialData={editingStudent}

                    onSubmit={handleSaveStudent}

                    loading={saving}

                />

            </Modal>

            <ConfirmModal

                isOpen={!!deleteStudentData}

                title="Delete Student"

                message={

                    deleteStudentData ?

                    `Delete ${deleteStudentData.name}?`

                    :

                    ""

                }

                loading={saving}

                onClose={() => setDeleteStudentData(null)}

                onConfirm={confirmDelete}

            />

        </AppLayout>

    );

};

export default Students;