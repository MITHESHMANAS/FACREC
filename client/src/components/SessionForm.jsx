import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getSubjects } from "../services/masterDataService";

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

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >

            <div>

                <label className="font-medium">
                    Subject
                </label>

                <select
                    {...register("subject")}
                    className="w-full border rounded-lg p-3"
                >

                    <option value="">
                        Select Subject
                    </option>

                    {

                        subjects.map(subject => (

                            <option
                                key={subject._id}
                                value={subject._id}
                            >

                                {subject.code} - {subject.name}

                            </option>

                        ))

                    }

                </select>

            </div>

            <div>

                <label>Faculty</label>

                <input
                    readOnly
                    {...register("faculty")}
                    className="w-full border rounded-lg p-3 bg-gray-100"
                />

            </div>

            <div>

                <label>Semester</label>

                <input
                    readOnly
                    {...register("semester")}
                    className="w-full border rounded-lg p-3 bg-gray-100"
                />

            </div>

            <div>

                <label>Branch</label>

                <input
                    readOnly
                    {...register("branch")}
                    className="w-full border rounded-lg p-3 bg-gray-100"
                />

            </div>

            <div>

                <label>Date</label>

                <input
                    type="date"
                    {...register("date")}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <div>

                <label>Start Time</label>

                <input
                    type="time"
                    {...register("startTime")}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <div>

                <label>End Time</label>

                <input
                    type="time"
                    {...register("endTime")}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <input
                type="hidden"
                {...register("status")}
            />

            <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >

                {

                    loading

                        ? "Saving..."

                        : initialData

                            ? "Update Session"

                            : "Create Session"

                }

            </button>

        </form>

    );

};

export default SessionForm;