import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { 
    FaBook, 
    FaUserTie, 
    FaBuilding, 
    FaSyncAlt, 
    FaPlus 
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import CardSkeleton from "../components/ui/CardSkeleton";
import SubjectGrid from "../components/SubjectGrid";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import SubjectForm from "../components/SubjectForm";
import RoleGuard from "../components/RoleGuard";
import KpiCard from "../components/ui/KpiCard";

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
    const [branchFilter, setBranchFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");

    const [open, setOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [deleteSubjectData, setDeleteSubjectData] = useState(null);

    const loadSubjects = async () => {
        try {
            const data = await getSubjects();
            setSubjects(data.subjects || []);
        } catch {
            toast.error("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const handleSaveSubject = async (subjectData) => {
        try {
            setSaving(true);
            if (editingSubject) {
                await updateSubject(editingSubject._id, subjectData);
                toast.success("Subject Updated Successfully");
            } else {
                await createSubject(subjectData);
                toast.success("Subject Added Successfully");
            }
            setOpen(false);
            setEditingSubject(null);
            loadSubjects();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation Failed");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (sub) => {
        setEditingSubject(sub);
        setOpen(true);
    };

    const handleDelete = (sub) => {
        setDeleteSubjectData(sub);
    };

    const confirmDelete = async () => {
        try {
            setSaving(true);
            await deleteSubject(deleteSubjectData._id);
            toast.success("Subject Removed");
            setDeleteSubjectData(null);
            loadSubjects();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete Failed");
        } finally {
            setSaving(false);
        }
    };

    // Prevent duplicate options due to differing capitalization formats
    const uniqueBranches = Array.from(
        new Set(
            subjects
                .map(s => s.branch?.trim())
                .filter(Boolean)
                .map(b => b.toUpperCase())
        )
    );

    const uniqueSemesters = Array.from(
        new Set(subjects.map(s => s.semester).filter(Boolean))
    ).sort((a, b) => a - b);

    const totalSubjects = subjects.length;
    const assignedFacultyCount = Array.from(new Set(subjects.map(s => s.faculty?._id || s.faculty).filter(Boolean))).length;
    const totalBranches = uniqueBranches.length;

    const filteredSubjects = subjects.filter((sub) => {
        const text = search.toLowerCase();
        const matchesSearch = (
            sub.name?.toLowerCase().includes(text) ||
            sub.code?.toLowerCase().includes(text) ||
            (sub.faculty?.name || "").toLowerCase().includes(text)
        );

        const matchesBranch = 
            branchFilter === "all" || 
            sub.branch?.trim().toUpperCase() === branchFilter.toUpperCase();

        const matchesSemester = 
            semesterFilter === "all" || 
            String(sub.semester) === String(semesterFilter);

        return matchesSearch && matchesBranch && matchesSemester;
    });

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-2">
                
                {/* 1. View Header Strip Layout */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage curriculum courses, metadata details, and faculty assignments.
                        </p>
                    </div>

                    <RoleGuard roles={["admin"]}>
                        <button
                            onClick={() => {
                                setEditingSubject(null);
                                setOpen(true);
                            }}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaPlus className="text-[10px]" />
                            Add Subject
                        </button>
                    </RoleGuard>
                </div>

                {/* 2. Symmetrical Workspace Filtering Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        <SearchBar
                            className="max-w-[480px] flex-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code, name or faculty..."
                        />

                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="w-40 h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                        >
                            <option value="all">All Branches</option>
                            {uniqueBranches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>

                        <select
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            className="w-40 h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                        >
                            <option value="all">All Semesters</option>
                            {uniqueSemesters.map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setLoading(true);
                            loadSubjects();
                        }}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition"
                        title="Refresh Grid Data"
                    >
                        <FaSyncAlt className={`text-slate-400 text-[11px] ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* 3. KPI Overview Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KpiCard
                        index={0}
                        title="Subjects"
                        value={totalSubjects}
                        icon={FaBook}
                        tone="indigo"
                    />
                    <KpiCard
                        index={1}
                        title="Faculty Assigned"
                        value={assignedFacultyCount}
                        icon={FaUserTie}
                        tone="amber"
                    />
                    <KpiCard
                        index={2}
                        title="Branches"
                        value={totalBranches}
                        icon={FaBuilding}
                        tone="slate"
                    />
                </div>

                {/* 4. Display Content Layout Block */}
                <div className="w-full min-h-[400px]">
                    {loading ? (
                        <CardSkeleton cards={6} />
                    ) : (
                        <AnimatePresence mode="wait">
                            <SubjectGrid
                                subjects={filteredSubjects}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </AnimatePresence>
                    )}
                </div>

            </div>

            {/* Application Modals View Container */}
            <Modal
                isOpen={open}
                title={editingSubject ? "Edit Course Parameters" : "Create New Subject"}
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
                title="Remove Course Record"
                message={deleteSubjectData ? `Are you sure you want to permanently delete ${deleteSubjectData.name} (${deleteSubjectData.code})? This clears all matching academic history.` : ""}
                loading={saving}
                onClose={() => setDeleteSubjectData(null)}
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
};

export default Subjects;