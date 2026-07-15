import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

import { getSubjects } from "../services/masterDataService";
import { getFaculty } from "../services/facultyService";
import FormInput from "./ui/FormInput";
import FormSelect from "./ui/FormSelect";
import Button from "./ui/Button";

const SessionForm = ({ onSubmit, loading, initialData = null }) => {
    const [subjects, setSubjects] = useState([]);
    const [facultyList, setFacultyList] = useState([]);

    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const selectedSubjectId = watch("subject");

    // 1. Load Master Data
    useEffect(() => {
        const loadMetadata = async () => {
            const [subjectsData, facultyData] = await Promise.all([
                getSubjects(), 
                getFaculty()
            ]);
            setSubjects(subjectsData || []);
            setFacultyList(Array.isArray(facultyData) ? facultyData : (facultyData?.faculty || []));
        };
        loadMetadata();
    }, []);

    // 2. Handle initialData (Editing) - Resolve Faculty Name
    useEffect(() => {
        if (initialData) {
            // Fill basic form data
            reset(initialData);

            // If we have the faculty list loaded, find the name matching the ID
            if (facultyList.length > 0) {
                const foundFaculty = facultyList.find(f => f._id === initialData.faculty);
                if (foundFaculty) {
                    setValue("faculty", foundFaculty.name);
                }
            }
        } else {
            reset({
                subject: "", faculty: "", semester: "", branch: "",
                date: new Date().toISOString().split("T")[0],
                startTime: "", endTime: "", status: "SCHEDULED"
            });
        }
    }, [initialData, facultyList, reset, setValue]);

    // 3. Auto-fill metadata when changing Subject in the dropdown
    useEffect(() => {
        const subject = subjects.find(s => s._id === selectedSubjectId);
        if (!subject) return;

        // Resolve Faculty Name from the subject object or facultyList
        let facultyName = "";
        if (typeof subject.faculty === 'object' && subject.faculty?.name) {
            facultyName = subject.faculty.name;
        } else {
            const found = facultyList.find(f => f._id === subject.faculty);
            facultyName = found ? found.name : (subject.faculty || "");
        }
        
        setValue("faculty", facultyName);
        setValue("semester", subject.semester || "");
        setValue("branch", subject.branch || "");
    }, [selectedSubjectId, subjects, facultyList, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Subject Selection</p>
                <div className="space-y-4">
                    <FormSelect label="Subject" {...register("subject", { required: true })}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
                        ))}
                    </FormSelect>

                    <div className="grid grid-cols-3 gap-4">
                        <FormInput label="Faculty" readOnly {...register("faculty")} />
                        <FormInput label="Semester" readOnly {...register("semester")} />
                        <FormInput label="Branch" readOnly {...register("branch")} />
                    </div>
                </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Schedule</p>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Date" type="date" icon={FaCalendarAlt} className="!pl-10" {...register("date", { required: true })} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Start" type="time" {...register("startTime", { required: true })} />
                        <FormInput label="End" type="time" {...register("endTime", { required: true })} />
                    </div>
                </div>
            </div>

            <input type="hidden" {...register("status")} />
            <Button type="submit" loading={loading} className="w-full" size="lg">
                {loading ? "Saving..." : initialData ? "Update Session" : "Create Session"}
            </Button>
        </form>
    );
};

export default SessionForm;