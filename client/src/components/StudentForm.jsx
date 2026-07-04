import { useEffect } from "react";
import { useForm } from "react-hook-form";

const StudentForm = ({
    onSubmit,
    loading,
    initialData = null
}) => {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {

        if (initialData) {

            reset({
                name: initialData.name,
                rollNo: initialData.rollNo,
                email: initialData.email,
                branch: initialData.branch,
                semester: initialData.semester
            });

        } else {

            reset({
                name: "",
                rollNo: "",
                email: "",
                branch: "CSE",
                semester: 1
            });

        }

    }, [initialData, reset]);

    const submit = (data) => {

        onSubmit(data);

    };

    return (

        <form
            onSubmit={handleSubmit(submit)}
            className="space-y-4"
        >

            <div>

                <label className="block mb-1 font-medium">
                    Name
                </label>

                <input
                    {...register("name", {
                        required: "Name is required"
                    })}
                    className="w-full border rounded-lg p-3"
                />

                <p className="text-red-500 text-sm">

                    {errors.name?.message}

                </p>

            </div>

            <div>

                <label className="block mb-1 font-medium">
                    Roll No
                </label>

                <input
                    {...register("rollNo", {
                        required: "Roll Number is required"
                    })}
                    className="w-full border rounded-lg p-3"
                />

                <p className="text-red-500 text-sm">

                    {errors.rollNo?.message}

                </p>

            </div>

            <div>

                <label className="block mb-1 font-medium">
                    Email
                </label>

                <input
                    type="email"
                    {...register("email", {
                        required: "Email is required"
                    })}
                    className="w-full border rounded-lg p-3"
                />

                <p className="text-red-500 text-sm">

                    {errors.email?.message}

                </p>

            </div>

            <div>

                <label className="block mb-1 font-medium">
                    Branch
                </label>

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

                <label className="block mb-1 font-medium">
                    Semester
                </label>

                <select
                    {...register("semester")}
                    className="w-full border rounded-lg p-3"
                >

                    {[1,2,3,4,5,6,7,8].map((sem) => (
                        <option
                            key={sem}
                            value={sem}
                        >
                            {sem}
                        </option>
                    ))}

                </select>

            </div>

            <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >

                {
                    loading
                        ? (initialData ? "Updating..." : "Adding...")
                        : (initialData ? "Update Student" : "Add Student")
                }

            </button>

        </form>

    );

};

export default StudentForm;