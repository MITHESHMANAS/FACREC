import { useEffect } from "react";
import { useForm } from "react-hook-form";

const SubjectForm = ({
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
                code: "",
                name: "",
                semester: 5,
                branch: "CSE",
                faculty: ""
            });

        }

    }, [initialData, reset]);

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >

            <div>

                <label>Subject Code</label>

                <input
                    {...register("code", {
                        required: "Subject Code is required"
                    })}
                    className="w-full border rounded-lg p-3"
                />

                <p className="text-red-500 text-sm">

                    {errors.code?.message}

                </p>

            </div>

            <div>

                <label>Subject Name</label>

                <input
                    {...register("name", {
                        required: "Subject Name is required"
                    })}
                    className="w-full border rounded-lg p-3"
                />

                <p className="text-red-500 text-sm">

                    {errors.name?.message}

                </p>

            </div>

            <div>

                <label>Semester</label>

                <select
                    {...register("semester")}
                    className="w-full border rounded-lg p-3"
                >

                    {[1,2,3,4,5,6,7,8].map((sem)=>(

                        <option
                            key={sem}
                            value={sem}
                        >

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

                <label>Faculty</label>

                <input
                    {...register("faculty")}
                    className="w-full border rounded-lg p-3"
                />

            </div>

            <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >

                {

                    loading

                        ?

                        initialData

                            ?

                            "Updating..."

                            :

                            "Adding..."

                        :

                        initialData

                            ?

                            "Update Subject"

                            :

                            "Add Subject"

                }

            </button>

        </form>

    );

};

export default SubjectForm;