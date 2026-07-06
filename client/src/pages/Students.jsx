import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StudentTable from "../components/StudentTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import StudentForm from "../components/StudentForm";
import RoleGuard from "../components/RoleGuard";
import StatsCard from "../components/StatsCard";

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

    const filteredStudents = students.filter((student) => {

        const text = search.toLowerCase();

        return (

            student.name.toLowerCase().includes(text) ||

            student.rollNo.toLowerCase().includes(text) ||

            student.email.toLowerCase().includes(text)

        );

    });

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <div className="p-8">

                    <div className="flex justify-between items-center mb-8">

                        <div>

                            <h1 className="text-4xl font-bold">

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

                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow"

                            >

                                + Add Student

                            </button>

                        </RoleGuard>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

                        <StatsCard
                            title="Total Students"
                            value={students.length}
                            color="text-indigo-600"
                        />

                        <StatsCard
                            title="Active"
                            value={students.filter(s => s.isActive).length}
                            color="text-green-600"
                        />

                        <StatsCard
                            title="CSE"
                            value={students.filter(s => s.branch === "CSE").length}
                            color="text-blue-600"
                        />

                        <StatsCard
                            title="ECE"
                            value={students.filter(s => s.branch === "ECE").length}
                            color="text-orange-600"
                        />

                        <StatsCard
                            title="ME"
                            value={students.filter(s => s.branch === "ME").length}
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

                        loading ?

                            <div className="flex justify-center py-20">

                                <BeatLoader color="#4f46e5" />

                            </div>

                            :

                            <StudentTable

                                students={filteredStudents}

                                onEdit={handleEdit}

                                onDelete={handleDelete}

                            />

                    }

                </div>

            </div>

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

        </div>

    );

};

export default Students;