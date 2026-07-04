import { useEffect } from "react";
import { useForm } from "react-hook-form";

const SessionForm = ({
    onSubmit,
    loading,
    initialData = null
}) => {

    const {
        register,
        handleSubmit,
        reset
    } = useForm();

    useEffect(() => {

        if (initialData) {

            reset(initialData);

        } else {

            reset({
                subject: "",
                faculty: "",
                semester: 5,
                branch: "CSE",
                date: "",
                startTime: "",
                endTime: "",
                status: "ACTIVE"
            });

        }

    }, [initialData, reset]);

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >

            <div>

                <label>Subject</label>

                <input
                    {...register("subject")}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <div>

                <label>Faculty</label>

                <input
                    {...register("faculty")}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <div>

                <label>Semester</label>

                <select
                    {...register("semester")}
                    className="w-full border rounded-lg p-3"
                >

                    {[1,2,3,4,5,6,7,8].map((sem)=>(
                        <option key={sem} value={sem}>
                            {sem}
                        </option>
                    ))}

                </select>

            </div>

            <div>

                <label>Branch</label>

                <select
                    {...register("branch")}
                    className="w-full border rounded-lg p-3"
                >

                    <option>CSE</option>
                    <option>ECE</option>
                    <option>ME</option>
                    <option>CE</option>

                </select>

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

            <div>

                <label>Status</label>

                <select
                    {...register("status")}
                    className="w-full border rounded-lg p-3"
                >

                    <option>ACTIVE</option>
                    <option>SCHEDULED</option>
                    <option>COMPLETED</option>

                </select>

            </div>

            <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >

                {
                    loading
                        ? (initialData ? "Updating..." : "Creating...")
                        : (initialData ? "Update Session" : "Create Session")
                }

            </button>

        </form>

    );

};

export default SessionForm;