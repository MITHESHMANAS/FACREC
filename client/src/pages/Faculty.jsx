import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaUserTie, 
    FaBuilding, 
    FaSyncAlt, 
    FaPlus 
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import TableSkeleton from "../components/ui/TableSkeleton";
import FacultyTable from "../components/FacultyTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import FacultyForm from "../components/FacultyForm";
import RoleGuard from "../components/RoleGuard";
import KpiCard from "../components/ui/KpiCard";

import {
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty
} from "../services/facultyService";

const Faculty = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deptFilter, setDeptFilter] = useState("all");

    const [open, setOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [deleteFacultyData, setDeleteFacultyData] = useState(null);

    const loadFaculty = async () => {
        try {
            const data = await getFaculty();
            setFacultyList(data.faculty || []);
        } catch {
            toast.error("Failed to load faculty records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFaculty();
    }, []);

    const handleSaveFaculty = async (faculty) => {
        try {
            setSaving(true);
            if (editingFaculty) {
                await updateFaculty(editingFaculty._id, faculty);
                toast.success("Faculty Profile Updated");
            } else {
                await createFaculty(faculty);
                toast.success("Faculty Account Added");
            }
            setOpen(false);
            setEditingFaculty(null);
            loadFaculty();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation Failed");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (fac) => {
        setEditingFaculty(fac);
        setOpen(true);
    };

    const handleDelete = (fac) => {
        setDeleteFacultyData(fac);
    };

    const confirmDelete = async () => {
        try {
            setSaving(true);
            await deleteFaculty(deleteFacultyData._id);
            toast.success("Faculty Record Removed");
            setDeleteFacultyData(null);
            loadFaculty();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete Failed");
        } finally {
            setSaving(false);
        }
    };

    const totalFaculty = facultyList.length;

    // Normalizes naming patterns to avoid casing duplication duplicates
    const uniqueDepts = Array.from(
        new Set(
            facultyList
                .map(f => f.department?.trim())
                .filter(Boolean)
                .map(d => d.toLowerCase())
        )
    ).map(lowerDept => {
        const match = facultyList.find(f => f.department?.toLowerCase() === lowerDept);
        return match ? match.department : lowerDept;
    });

    const totalBranches = uniqueDepts.length;

    const filteredFaculty = facultyList.filter((fac) => {
        const text = search.toLowerCase();
        const matchesSearch = (
            fac.name?.toLowerCase().includes(text) ||
            fac.employeeId?.toLowerCase().includes(text) ||
            fac.email?.toLowerCase().includes(text)
        );

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" ? fac.isActive : !fac.isActive);

        const matchesDept = 
            deptFilter === "all" || 
            fac.department?.toLowerCase() === deptFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesDept;
    });

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-2">
                
                {/* Heading Area Block */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Faculty</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage department staff members, profiles and system roles.
                        </p>
                    </div>

                    <RoleGuard roles={["admin"]}>
                        <button
                            onClick={() => {
                                setEditingFaculty(null);
                                setOpen(true);
                            }}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaPlus className="text-[10px]" />
                            Add Faculty
                        </button>
                    </RoleGuard>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        <SearchBar
                            className="max-w-[480px] flex-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email or employee ID..."
                        />

                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="w-44 h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                        >
                            <option value="all">All Departments</option>
                            {uniqueDepts.map(d => (
                                <option key={d} value={d}>{d}</option>
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
                            loadFaculty();
                        }}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition"
                        title="Refresh Grid Data"
                    >
                        <FaSyncAlt className={`text-slate-400 text-[11px] ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* KPI Overview Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KpiCard
                        index={0}
                        title="Total Faculty"
                        value={totalFaculty}
                        icon={FaUserTie}
                        tone="indigo"
                    />
                    <KpiCard
                        index={1}
                        title="Branches"
                        value={totalBranches}
                        icon={FaBuilding}
                        tone="slate"
                    />
                </div>

                {/* Scroll Box Container */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <TableSkeleton rows={4} columns={7} />
                        ) : (
                            <AnimatePresence mode="wait">
                                <FacultyTable
                                    faculty={filteredFaculty}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Components */}
            <Modal
                isOpen={open}
                title={editingFaculty ? "Edit Faculty Profile" : "Create Faculty Account"}
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
                title="Remove Faculty Account"
                message={deleteFacultyData ? `Are you sure you want to completely remove ${deleteFacultyData.name} from the directory context?` : ""}
                loading={saving}
                onClose={() => setDeleteFacultyData(null)}
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
};

export default Faculty;