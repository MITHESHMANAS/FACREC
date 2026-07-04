import { useEffect } from "react";
import { useForm } from "react-hook-form";

const FacultyForm = ({
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

            reset(initialData);

        } else {

            reset({
                name: "",
                email: "",
                employeeId: "",
                department: "CSE",
                designation: "Professor"
            });

        }

    }, [initialData, reset]);

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >

            <div>

                <label>Name</label>

                <input
                    {...register("name", { required: "Required" })}
                    className="w-full border rounded-lg p-3"
                />

                <p className="text-red-500 text-sm">
                    {errors.name?.message}
                </p>

            </div>

            <div>

                <label>Email</label>

                <input
                    type="email"
                    {...register("email", { required: "Required" })}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <div>

                <label>Employee ID</label>

                <input
                    {...register("employeeId", { required: "Required" })}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <div>

                <label>Department</label>

                <select
                    {...register("department")}
                    className="w-full border rounded-lg p-3"
                >

                    <option>CSE</option>
                    <option>ECE</option>
                    <option>ME</option>
                    <option>CE</option>

                </select>

            </div>

            <div>

                <label>Designation</label>

                <select
                    {...register("designation")}
                    className="w-full border rounded-lg p-3"
                >

                    <option>Professor</option>
                    <option>Associate Professor</option>
                    <option>Assistant Professor</option>

                </select>

            </div>

            <button
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >

                {
                    loading
                        ? (initialData ? "Updating..." : "Adding...")
                        : (initialData ? "Update Faculty" : "Add Faculty")
                }

            </button>

        </form>

    );

};

export default FacultyForm;