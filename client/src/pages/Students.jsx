import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaUserGraduate, 
    FaCamera, 
    FaClipboardCheck, 
    FaExclamationTriangle, 
    FaSyncAlt, 
    FaPlus 
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import TableSkeleton from "../components/ui/TableSkeleton";
import StudentTable from "../components/StudentTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import StudentForm from "../components/StudentForm";
import RoleGuard from "../components/RoleGuard";
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
    const [statusFilter, setStatusFilter] = useState("all");
    const [branchFilter, setBranchFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");

    const [open, setOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [deleteStudentData, setDeleteStudentData] = useState(null);

    const loadStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data.students);
        } catch {
            toast.error("Failed to load students");
        } finally {
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
                await updateStudent(editingStudent._id, student);
                toast.success("Student Updated");
            } else {
                await createStudent(student);
                toast.success("Student Added");
            }
            setOpen(false);
            setEditingStudent(null);
            loadStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation Failed");
        } finally {
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
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete Failed");
        } finally {
            setSaving(false);
        }
    };

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const registeredFaces = students.filter(s => s.faceDatasetId || s.faceId || s.faceRegistered).length;
    const pendingRegistration = totalStudents - registeredFaces;
    const attendanceToday = activeStudents; 

    const uniqueBranches = Array.from(new Set(students.map(s => s.branch).filter(Boolean)));
    const uniqueSemesters = Array.from(new Set(students.map(s => s.semester).filter(Boolean))).sort((a, b) => a - b);

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

        const matchesBranch = branchFilter === "all" || student.branch === branchFilter;
        const matchesSemester = semesterFilter === "all" || String(student.semester) === String(semesterFilter);

        return matchesSearch && matchesStatus && matchesBranch && matchesSemester;
    });

    return (
        <AppLayout>
            <div className="flex flex-col gap-y-6">
                
                {/* 1. Heading Layout Block */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Students
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage registrations, profiles and face enrollment.
                        </p>
                    </div>

                    <RoleGuard roles={["admin"]}>
                        <button
                            onClick={() => {
                                setEditingStudent(null);
                                setOpen(true);
                            }}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaPlus className="text-[10px]" />
                            Add Student
                        </button>
                    </RoleGuard>
                </div>

                {/* 2. Workspace Management Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        <SearchBar
                            className="max-w-[480px] flex-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search students..."
                        />

                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="w-36 h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                        >
                            <option value="all">All Branches</option>
                            {uniqueBranches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>

                        <select
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            className="w-36 h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                        >
                            <option value="all">All Semesters</option>
                            {uniqueSemesters.map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-36 h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
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
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition"
                        title="Refresh Grid Data"
                    >
                        <FaSyncAlt className={`text-slate-400 text-[11px] ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* 3. KPI Metrics Layout Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        index={0}
                        title="Total Students"
                        value={totalStudents}
                        icon={FaUserGraduate}
                        tone="indigo"
                    />
                    <KpiCard
                        index={1}
                        title="Face Registered"
                        value={registeredFaces}
                        icon={FaCamera}
                        tone="emerald"
                    />
                    <KpiCard
                        index={2}
                        title="Today's Attendance"
                        value={attendanceToday}
                        icon={FaClipboardCheck}
                        tone="blue"
                    />
                    <KpiCard
                        index={3}
                        title="Pending Registration"
                        value={pendingRegistration}
                        icon={FaExclamationTriangle}
                        tone="amber"
                    />
                </div>

                {/* 4. Scrollable Data Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <TableSkeleton rows={6} columns={8} />
                        ) : (
                            <AnimatePresence mode="wait">
                                <StudentTable
                                    students={filteredStudents}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </AnimatePresence>
                        )}
                    </div>
                </div>

            </div>

            {/* Application Layer Modals */}
            <Modal
                isOpen={open}
                title={editingStudent ? "Edit Student Profile" : "Create Student Account"}
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
                title="Remove Student Account"
                message={deleteStudentData ? `Are you sure you want to completely remove ${deleteStudentData.name} from the directory context? This action blocks biometric face authentication pipelines immediately.` : ""}
                loading={saving}
                onClose={() => setDeleteStudentData(null)}
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
};

export default Students;