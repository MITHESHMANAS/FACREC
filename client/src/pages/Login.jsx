import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    FaArrowRight,
    FaBolt,
    FaCamera,
    FaChartLine,
    FaCheck,
    FaEnvelope,
    FaExclamationCircle,
    FaEye,
    FaEyeSlash,
    FaLock,
    FaShieldAlt,
    FaUserShield
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";

import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
    { icon: FaCamera, title: "Real-time recognition", text: "Face-recognition attendance, no roll calls" },
    { icon: FaChartLine, title: "Live analytics", text: "Insight across every session and subject" },
    { icon: FaUserShield, title: "Role-based access", text: "Separate workspaces for admins, faculty & students" }
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Left panel: animated face-scan showcase                             */
/* ------------------------------------------------------------------ */

const ScanCard = () => (
    <div className="relative facrec-float">

        {/* soft glow behind the card */}
        <div className="absolute inset-0 -m-6 rounded-[36px] bg-indigo-500/20 blur-2xl" />

        <div className="relative w-[250px] h-[290px] rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md overflow-hidden shadow-2xl shadow-indigo-950/60">

            {/* face silhouette */}
            <svg
                viewBox="0 0 200 240"
                className="absolute inset-0 w-full h-full"
                fill="none"
                aria-hidden="true"
            >
                <ellipse cx="100" cy="98" rx="46" ry="56" stroke="rgba(165,180,252,0.55)" strokeWidth="1.5" />
                <path d="M28 232c6-42 34-64 72-64s66 22 72 64" stroke="rgba(165,180,252,0.35)" strokeWidth="1.5" />
                <circle cx="82" cy="90" r="3.5" fill="rgba(199,210,254,0.9)" />
                <circle cx="118" cy="90" r="3.5" fill="rgba(199,210,254,0.9)" />
                <path d="M86 124q14 10 28 0" stroke="rgba(199,210,254,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                {[[70, 60], [130, 60], [58, 100], [142, 100], [76, 142], [124, 142], [100, 154]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2" fill="rgba(129,140,248,0.9)" />
                ))}
            </svg>

            {/* detection corner brackets */}
            {[
                "top-5 left-5 border-t-2 border-l-2 rounded-tl-xl",
                "top-5 right-5 border-t-2 border-r-2 rounded-tr-xl",
                "bottom-5 left-5 border-b-2 border-l-2 rounded-bl-xl",
                "bottom-5 right-5 border-b-2 border-r-2 rounded-br-xl"
            ].map((c) => (
                <span key={c} className={`absolute w-7 h-7 border-indigo-300/80 ${c}`} />
            ))}

            {/* scan line */}
            <div className="facrec-scan-line absolute left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-indigo-300 to-transparent shadow-[0_0_18px_4px_rgba(129,140,248,0.55)]" />
        </div>

        {/* floating "recognized" chip */}
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 140, damping: 14 }}
            className="absolute -bottom-5 -right-10 flex items-center gap-2.5 rounded-2xl bg-white/95 pl-2.5 pr-4 py-2.5 shadow-xl shadow-black/30"
        >
            <span className="relative flex w-8 h-8 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                <span className="facrec-pulse-ring absolute inset-0 rounded-full bg-emerald-400" />
                <FaCheck className="relative" />
            </span>
            <span className="leading-tight">
                <span className="block text-[11px] font-semibold text-slate-800">Attendance marked</span>
                <span className="block text-[10px] text-slate-500">Identity verified</span>
            </span>
        </motion.div>
    </div>
);

const BrandPanel = () => (
    <div className="hidden lg:flex lg:w-[52%] h-full relative overflow-hidden bg-[#0b1020] text-white flex-col justify-between gap-6 px-[clamp(2rem,4.5vw,4rem)] py-[clamp(1.25rem,4.5vh,3.5rem)]">

        {/* atmosphere */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0b1020] via-[#141a4a] to-[#0b1020]" />
        <div className="facrec-grid-bg absolute inset-0" />
        <div className="facrec-drift-a absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="facrec-drift-b absolute -bottom-40 -left-24 w-[24rem] h-[24rem] rounded-full bg-violet-600/25 blur-3xl" />

        {/* brand */}
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex items-center gap-3"
        >
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <FaBolt className="text-white" />
            </div>
            <div>
                <p className="font-bold tracking-tight text-lg leading-none">FACREC</p>
                <p className="text-xs text-slate-400 mt-1">Attendance Platform</p>
            </div>
        </motion.div>

        {/* hero */}
        <div className="relative min-h-0 flex items-center justify-between gap-10 xl:gap-16">

            <div className="max-w-md">
                <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[clamp(1.75rem,min(4.6vh,3.3vw),2.75rem)] font-semibold leading-[1.1] tracking-tight"
                >
                    Attendance,{" "}
                    <span className="bg-linear-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
                        resolved by a glance.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-slate-400 mt-[clamp(0.75rem,2vh,1.25rem)] text-[clamp(0.8rem,1.9vh,1rem)] leading-relaxed [@media(max-height:560px)]:hidden"
                >
                    FACREC replaces manual roll calls with face-recognition
                    sessions, live dashboards and audit-ready reports for your
                    entire institution.
                </motion.p>

                <ul className="mt-[clamp(1.25rem,4vh,2.5rem)] space-y-[clamp(0.75rem,2.4vh,1.25rem)]">
                    {FEATURES.map((f, i) => (
                        <motion.li
                            key={f.title}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.1, duration: 0.5 }}
                            className="flex items-center gap-4"
                        >
                            <span className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-indigo-300 text-sm shrink-0">
                                <f.icon />
                            </span>
                            <span>
                                <span className="block text-sm font-medium text-slate-100">{f.title}</span>
                                <span className="hidden [@media(min-height:740px)]:block text-sm text-slate-400 mt-0.5">{f.text}</span>
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="hidden min-[1400px]:[@media(min-height:720px)]:block shrink-0 pr-8"
            >
                <ScanCard />
            </motion.div>
        </div>

        {/* footer */}
        <div className="relative flex items-center justify-between text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} FACREC. Built for modern campuses.</p>
            <p className="flex items-center gap-1.5">
                <FaShieldAlt className="text-slate-400" />
                Secured sign-in
            </p>
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/* Right panel: form                                                   */
/* ------------------------------------------------------------------ */

const fieldShell = (hasError) =>
    `group flex items-center gap-3 border rounded-[14px] mt-2 px-4 transition-all duration-200 ${
        hasError
            ? "border-red-300 bg-red-50/60 focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-400"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10"
    }`;

const Login = () => {

    const navigate = useNavigate();
    const { user, loginUser } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState("");
    const [capsOn, setCapsOn] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ mode: "onTouched" });

    // Already signed in (e.g. reopened /login) -> straight to the app.
    // `success` guard lets the sign-in animation finish first.
    if (user && !success) {
        return <Navigate to="/" replace />;
    }

    const onSubmit = async (formData) => {

        setServerError("");
        setLoading(true);

        try {

            const data = await login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });

            loginUser(data.token, data.user);
            setSuccess(true);

            setTimeout(() => navigate("/", { replace: true }), 900);

        } catch (err) {

            const message =
                err.response?.data?.message ||
                (err.request
                    ? "Cannot reach the server. Check that the backend is running."
                    : "Login failed. Please try again.");

            setServerError(message);
            setShakeKey((k) => k + 1);

        } finally {

            setLoading(false);

        }

    };

    const busy = loading || success;

    return (

        <div className="h-dvh w-full flex overflow-hidden bg-slate-50">

            <BrandPanel />

            <div className="relative flex-1 h-full flex px-5 sm:px-10 py-[clamp(0.75rem,3vh,2.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                {/* subtle backdrop for the form side */}
                <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_80%_-10%,rgba(99,102,241,0.08),transparent),radial-gradient(40rem_30rem_at_0%_110%,rgba(139,92,246,0.06),transparent)]" />

                <motion.div
                    key={shakeKey}
                    initial={{ opacity: 0, y: 18 }}
                    animate={
                        shakeKey > 0 && serverError
                            ? { opacity: 1, y: 0, x: [0, -9, 9, -6, 6, -3, 0] }
                            : { opacity: 1, y: 0, x: 0 }
                    }
                    transition={
                        shakeKey > 0 && serverError
                            ? { duration: 0.45 }
                            : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="relative m-auto w-full max-w-[440px] bg-white border border-slate-200/80 rounded-[24px] shadow-2xl shadow-slate-300/40 px-7 sm:px-10 py-[clamp(1.25rem,4.2vh,2.5rem)]"
                >

                    {/* mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <FaBolt />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 leading-none">FACREC</p>
                            <p className="text-xs text-slate-500 mt-1">Attendance Platform</p>
                        </div>
                    </div>

                    <h2 className="text-[clamp(1.375rem,3.4vh,1.625rem)] font-semibold text-slate-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                        Sign in to your FACREC workspace to continue.
                    </p>

                    {/* server error banner */}
                    <AnimatePresence initial={false}>
                        {serverError && (
                            <motion.div
                                role="alert"
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                                    <FaExclamationCircle className="mt-0.5 shrink-0" />
                                    <span>{serverError}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="mt-[clamp(1rem,3vh,1.75rem)] space-y-[clamp(0.75rem,2.4vh,1.25rem)]"
                    >

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email
                            </label>

                            <div className={fieldShell(!!errors.email)}>
                                <FaEnvelope className="text-slate-400 group-focus-within:text-indigo-500 text-sm shrink-0 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    autoFocus
                                    autoComplete="username"
                                    inputMode="email"
                                    spellCheck={false}
                                    placeholder="you@facrec.edu"
                                    aria-invalid={!!errors.email}
                                    className="w-full py-[clamp(0.6rem,1.9vh,0.875rem)] bg-transparent text-sm text-slate-900 placeholder:text-slate-400"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: EMAIL_PATTERN,
                                            message: "Enter a valid email address"
                                        },
                                        onChange: () => serverError && setServerError("")
                                    })}
                                />
                            </div>

                            <AnimatePresence initial={false}>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-red-600 text-xs mt-2"
                                    >
                                        {errors.email.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowHelp((v) => !v)}
                                    aria-expanded={showHelp}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {showHelp && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="mt-2 rounded-xl bg-indigo-50 border border-indigo-100 px-3.5 py-2.5 text-xs text-indigo-800 leading-relaxed">
                                            Password resets are handled by your institution.
                                            Please contact your FACREC administrator to have
                                            your password reset.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={fieldShell(!!errors.password)}>
                                <FaLock className="text-slate-400 group-focus-within:text-indigo-500 text-sm shrink-0 transition-colors" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    aria-invalid={!!errors.password}
                                    className="w-full py-[clamp(0.6rem,1.9vh,0.875rem)] bg-transparent text-sm text-slate-900 placeholder:text-slate-400"
                                    onKeyUp={(e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false)}
                                    onBlur={() => setCapsOn(false)}
                                    {...register("password", {
                                        required: "Password is required",
                                        onChange: () => serverError && setServerError("")
                                    })}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 rounded-md"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {errors.password ? (
                                    <motion.p
                                        key="pw-err"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-red-600 text-xs mt-2"
                                    >
                                        {errors.password.message}
                                    </motion.p>
                                ) : capsOn ? (
                                    <motion.p
                                        key="pw-caps"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-amber-600 text-xs mt-2 flex items-center gap-1.5"
                                    >
                                        <FaExclamationCircle /> Caps Lock is on
                                    </motion.p>
                                ) : null}
                            </AnimatePresence>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={busy}
                            whileHover={busy ? undefined : { y: -1 }}
                            whileTap={busy ? undefined : { scale: 0.985 }}
                            className={`relative w-full overflow-hidden rounded-[14px] py-[clamp(0.65rem,1.9vh,0.875rem)] font-semibold text-white text-sm transition-all duration-300 shadow-lg ${
                                success
                                    ? "bg-emerald-500 shadow-emerald-500/25"
                                    : "bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/25 disabled:opacity-80"
                            }`}
                        >
                            {!busy && (
                                <span className="facrec-shimmer pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                            )}

                            <span className="relative flex items-center justify-center gap-2 h-5">
                                {success ? (
                                    <motion.span
                                        initial={{ scale: 0, rotate: -30 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="flex items-center gap-2"
                                    >
                                        <FaCheck /> Signed in
                                    </motion.span>
                                ) : loading ? (
                                    <>
                                        <ClipLoader color="white" size={16} />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <FaArrowRight className="text-xs" />
                                    </>
                                )}
                            </span>
                        </motion.button>

                    </form>

                    <p className="mt-[clamp(1rem,3vh,1.75rem)] pt-[clamp(0.75rem,2.4vh,1.5rem)] border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 [@media(max-height:600px)]:hidden">
                        <FaShieldAlt />
                        Protected access for authorised campus users only
                    </p>

                </motion.div>

            </div>

        </div>

    );

};

export default Login;