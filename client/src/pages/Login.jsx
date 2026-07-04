import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();

    const { loginUser } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (formData) => {

        try {

            setLoading(true);

            const data = await login(formData);

            loginUser(data.token, data.user);

            toast.success("Login Successful");

            setTimeout(() => {

                navigate("/");

            }, 1000);

        }

        catch (err) {

            toast.error(
                err.response?.data?.message || "Login Failed"
            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">

            <Toaster position="top-right" />

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

                <div className="text-center mb-8">

                    <h1 className="text-5xl font-bold text-indigo-700">
                        FACREC
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Face Recognition Attendance System
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    <div>

                        <label className="font-semibold">
                            Email
                        </label>

                        <div className="flex items-center border rounded-lg mt-2 px-3">

                            <FaEnvelope className="text-gray-400" />

                            <input
                                className="w-full p-3"
                                placeholder="Enter your email"
                                {...register("email", {
                                    required: "Email is required"
                                })}
                            />

                        </div>

                        <p className="text-red-500 text-sm mt-1">
                            {errors.email?.message}
                        </p>

                    </div>

                    <div>

                        <label className="font-semibold">
                            Password
                        </label>

                        <div className="flex items-center border rounded-lg mt-2 px-3">

                            <FaLock className="text-gray-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full p-3"
                                placeholder="Enter your password"
                                {...register("password", {
                                    required: "Password is required"
                                })}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {
                                    showPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />
                                }
                            </button>

                        </div>

                        <p className="text-red-500 text-sm mt-1">
                            {errors.password?.message}
                        </p>

                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 font-semibold"
                    >

                        {
                            loading
                                ? <ClipLoader color="white" size={20} />
                                : "Login"
                        }

                    </button>

                </form>

            </div>

        </div>

    );

};

export default Login;