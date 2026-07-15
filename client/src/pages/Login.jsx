import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBolt, FaUserShield, FaChartLine, FaCamera } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
    { icon: FaCamera, text: "Real-time face recognition attendance" },
    { icon: FaChartLine, text: "Live analytics across every session" },
    { icon: FaUserShield, text: "Role-based access for admins & faculty" }
];

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

        <div className="min-h-screen flex bg-slate-50">

            <Toaster position="top-right" />

            {/* Left - branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex-col justify-between p-12">

                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                        <FaBolt className="text-indigo-300" />
                    </div>
                    <div>
                        <p className="font-bold tracking-tight">FACREC</p>
                        <p className="text-xs text-slate-400">Attendance Platform</p>
                    </div>
                </div>

                <div className="relative max-w-md">
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                        Attendance, resolved by a glance.
                    </h1>
                    <p className="text-slate-400 mt-4 leading-relaxed">
                        FACREC replaces manual roll calls with face-recognition
                        sessions, live dashboards and audit-ready reports for
                        your entire institution.
                    </p>

                    <div className="mt-10 space-y-4">
                        {
                            FEATURES.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + i * 0.08 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 text-sm shrink-0">
                                        <f.icon />
                                    </div>
                                    <p className="text-sm text-slate-300">{f.text}</p>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>

                <p className="relative text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} FACREC. Built for modern campuses.
                </p>

            </div>

            {/* Right - form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur border border-slate-200 rounded-[20px] shadow-xl shadow-slate-200/50 p-8 sm:p-10"
                >

                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                            <FaBolt />
                        </div>
                        <p className="font-bold text-slate-800">FACREC</p>
                    </div>

                    <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="text-slate-500 mt-1.5 text-sm">
                        Sign in to your FACREC workspace to continue.
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5 mt-8"
                    >

                        <div>

                            <label className="text-sm font-medium text-slate-600">
                                Email
                            </label>

                            <div className="flex items-center border border-slate-200 bg-slate-50 rounded-[14px] mt-2 px-3.5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 focus-within:bg-white transition">

                                <FaEnvelope className="text-slate-400 text-sm" />

                                <input
                                    className="w-full p-3 outline-none bg-transparent text-sm"
                                    placeholder="you@facrec.edu"
                                    {...register("email", {
                                        required: "Email is required"
                                    })}
                                />

                            </div>

                            {
                                errors.email &&
                                <p className="text-red-500 text-xs mt-1.5">
                                    {errors.email.message}
                                </p>
                            }

                        </div>

                        <div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-600">
                                    Password
                                </label>
                                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                                    Forgot password?
                                </button>
                            </div>

                            <div className="flex items-center border border-slate-200 bg-slate-50 rounded-[14px] mt-2 px-3.5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 focus-within:bg-white transition">

                                <FaLock className="text-slate-400 text-sm" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-3 outline-none bg-transparent text-sm"
                                    placeholder="Enter your password"
                                    {...register("password", {
                                        required: "Password is required"
                                    })}
                                />

                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="text-slate-400 hover:text-slate-600 transition"
                                >
                                    {
                                        showPassword
                                            ? <FaEyeSlash />
                                            : <FaEye />
                                    }
                                </button>

                            </div>

                            {
                                errors.password &&
                                <p className="text-red-500 text-xs mt-1.5">
                                    {errors.password.message}
                                </p>
                            }

                        </div>

                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-[14px] py-3.5 font-semibold transition shadow-lg shadow-indigo-600/20"
                        >

                            {
                                loading
                                    ? <ClipLoader color="white" size={20} />
                                    : "Sign in"
                            }

                        </motion.button>

                    </form>

                </motion.div>

            </div>

        </div>

    );

};

export default Login;