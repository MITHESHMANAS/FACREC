import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaIdCard } from "react-icons/fa";

import FormInput from "./ui/FormInput";
import FormSelect from "./ui/FormSelect";
import Button from "./ui/Button";

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
                        {...register("name", { required: "Required" })}
                    />

                    <FormInput
                        label="Email"
                        type="email"
                        icon={FaEnvelope}
                        placeholder="faculty@college.edu"
                        error={errors.email?.message}
                        {...register("email", { required: "Required" })}
                    />

                </div>

            </div>

            <div className="pt-5 border-t border-slate-100">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Professional Details
                </p>

                <div className="space-y-4">

                    <FormInput
                        label="Employee ID"
                        icon={FaIdCard}
                        placeholder="e.g. EMP1024"
                        error={errors.employeeId?.message}
                        {...register("employeeId", { required: "Required" })}
                    />

                    <div className="grid grid-cols-2 gap-4">

                        <FormSelect label="Department" {...register("department")}>
                            <option>CSE</option>
                            <option>ECE</option>
                            <option>ME</option>
                            <option>CE</option>
                        </FormSelect>

                        <FormSelect label="Designation" {...register("designation")}>
                            <option>Professor</option>
                            <option>Associate Professor</option>
                            <option>Assistant Professor</option>
                        </FormSelect>

                    </div>

                </div>

            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
                {
                    loading
                        ? (initialData ? "Updating..." : "Adding...")
                        : (initialData ? "Update Faculty" : "Add Faculty")
                }
            </Button>

        </form>

    );

};

export default FacultyForm;
