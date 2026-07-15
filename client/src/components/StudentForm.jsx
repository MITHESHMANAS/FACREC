import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaIdCard, FaEnvelope } from "react-icons/fa";

import FormInput from "./ui/FormInput";
import FormSelect from "./ui/FormSelect";
import Button from "./ui/Button";

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

        <form onSubmit={handleSubmit(submit)} className="space-y-6">

            <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Personal Information
                </p>

                <div className="space-y-4">

                    <FormInput
                        label="Name"
                        icon={FaUser}
                        placeholder="Full name"
                        error={errors.name?.message}
                        {...register("name", { required: "Name is required" })}
                    />

                    <FormInput
                        label="Roll No"
                        icon={FaIdCard}
                        placeholder="e.g. 21CSE045"
                        error={errors.rollNo?.message}
                        {...register("rollNo", { required: "Roll Number is required" })}
                    />

                    <FormInput
                        label="Email"
                        type="email"
                        icon={FaEnvelope}
                        placeholder="student@college.edu"
                        error={errors.email?.message}
                        {...register("email", { required: "Email is required" })}
                    />

                </div>

            </div>

            <div className="pt-5 border-t border-slate-100">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Academic Details
                </p>

                <div className="grid grid-cols-2 gap-4">

                    <FormSelect label="Branch" {...register("branch")}>
                        <option>CSE</option>
                        <option>ECE</option>
                        <option>ME</option>
                        <option>CE</option>
                    </FormSelect>

                    <FormSelect label="Semester" {...register("semester")}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </FormSelect>

                </div>

            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
                {
                    loading
                        ? (initialData ? "Updating..." : "Adding...")
                        : (initialData ? "Update Student" : "Add Student")
                }
            </Button>

        </form>

    );

};

export default StudentForm;
