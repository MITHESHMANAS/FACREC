import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

import { getSubjects } from "../services/masterDataService";
import FormInput from "./ui/FormInput";
import FormSelect from "./ui/FormSelect";
import Button from "./ui/Button";

const SessionForm = ({
    onSubmit,
    loading,
    initialData = null
}) => {

    const [subjects, setSubjects] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue
    } = useForm();

    const selectedSubjectId = watch("subject");

    useEffect(() => {

        const loadSubjects = async () => {
            const data = await getSubjects();
            setSubjects(data);
        };

        loadSubjects();

    }, []);

    useEffect(() => {

        if (initialData) {

            reset(initialData);

        }

        else {

            reset({

                subject: "",
                faculty: "",
                semester: 5,
                branch: "CSE",
                date: new Date().toISOString().split("T")[0],
                startTime: "",
                endTime: "",
                status: "SCHEDULED"

            });

        }

    }, [initialData, reset]);

    useEffect(() => {

        const subject = subjects.find(
            s => s._id === selectedSubjectId
        );

        if (!subject) return;

        setValue("faculty", subject.faculty);
        setValue("semester", subject.semester);
        setValue("branch", subject.branch);

    }, [selectedSubjectId, subjects, setValue]);

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Subject Selection
                </p>

                <div className="space-y-4">

                    <FormSelect label="Subject" {...register("subject")}>
                        <option value="">Select Subject</option>
                        {
                            subjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.code} - {subject.name}
                                </option>
                            ))
                        }
                    </FormSelect>

                    <div className="grid grid-cols-3 gap-4">

                        <FormInput
                            label="Faculty"
                            readOnly
                            disabled
                            {...register("faculty")}
                        />

                        <FormInput
                            label="Semester"
                            readOnly
                            disabled
                            {...register("semester")}
                        />

                        <FormInput
                            label="Branch"
                            readOnly
                            disabled
                            {...register("branch")}
                        />

                    </div>

                </div>

            </div>

            <div className="pt-5 border-t border-slate-100">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Schedule
                </p>

                <div className="space-y-4">

                    <FormInput
                        label="Date"
                        type="date"
                        icon={FaCalendarAlt}
                        {...register("date")}
                    />

                    <div className="grid grid-cols-2 gap-4">

                        <FormInput
                            label="Start Time"
                            type="time"
                            icon={FaClock}
                            {...register("startTime")}
                        />

                        <FormInput
                            label="End Time"
                            type="time"
                            icon={FaClock}
                            {...register("endTime")}
                        />

                    </div>

                </div>

            </div>

            <input type="hidden" {...register("status")} />

            <Button type="submit" loading={loading} className="w-full" size="lg">
                {
                    loading
                        ? "Saving..."
                        : initialData
                            ? "Update Session"
                            : "Create Session"
                }
            </Button>

        </form>

    );

};

export default SessionForm;
