import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaHashtag, FaBook, FaChalkboardTeacher } from "react-icons/fa";

import FormInput from "./ui/FormInput";
import FormSelect from "./ui/FormSelect";
import Button from "./ui/Button";

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Subject Details
                </p>

                <div className="space-y-4">

                    <FormInput
                        label="Subject Code"
                        icon={FaHashtag}
                        placeholder="e.g. CS501"
                        error={errors.code?.message}
                        {...register("code", { required: "Subject Code is required" })}
                    />

                    <FormInput
                        label="Subject Name"
                        icon={FaBook}
                        placeholder="e.g. Distributed Systems"
                        error={errors.name?.message}
                        {...register("name", { required: "Subject Name is required" })}
                    />

                </div>

            </div>

            <div className="pt-5 border-t border-slate-100">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Academic Assignment
                </p>

                <div className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">

                        <FormSelect label="Semester" {...register("semester")}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </FormSelect>

                        <FormSelect label="Branch" {...register("branch")}>
                            <option>CSE</option>
                            <option>ECE</option>
                            <option>ME</option>
                            <option>CE</option>
                        </FormSelect>

                    </div>

                    <FormInput
                        label="Faculty"
                        icon={FaChalkboardTeacher}
                        placeholder="Assigned faculty name"
                        {...register("faculty")}
                    />

                </div>

            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
                {
                    loading
                        ? (initialData ? "Updating..." : "Adding...")
                        : (initialData ? "Update Subject" : "Add Subject")
                }
            </Button>

        </form>

    );

};

export default SubjectForm;
