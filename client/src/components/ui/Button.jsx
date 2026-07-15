/**
 * The one button the whole app should use for anything that isn't a
 * bare icon-action (see ActionButtons.jsx for those). Every page
 * currently hand-types its own `bg-indigo-600 hover:bg-indigo-700
 * disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg` string -
 * this is that string, once, with a variant prop instead.
 */
const VARIANTS = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white"
};

const SIZES = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-6 py-3 text-lg"
};

const Button = ({
    children,
    variant = "primary",
    size = "md",
    icon = null,
    loading = false,
    disabled = false,
    type = "button",
    className = "",
    ...rest
}) => {

    return (

        <button
            type={type}
            disabled={disabled || loading}
            className={
                `inline-flex items-center justify-center gap-2 rounded-[14px] ` +
                `font-medium transition-all duration-150 disabled:bg-gray-400 ` +
                `disabled:cursor-not-allowed disabled:text-white disabled:translate-y-0 disabled:shadow-none ` +
                `hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm ` +
                `${VARIANTS[variant] || VARIANTS.primary} ` +
                `${SIZES[size] || SIZES.md} ${className}`
            }
            {...rest}
        >

            {
                loading &&
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            }

            {!loading && icon}

            {children}

        </button>

    );

};

export default Button;
