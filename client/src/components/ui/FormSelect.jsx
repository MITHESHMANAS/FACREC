import { forwardRef } from "react";
import { FaChevronDown } from "react-icons/fa";

/**
 * Drop-in replacement for a hand-styled `<select>` + `<label>` pair.
 * Same spread-register-directly-onto-it usage as FormInput.
 */
const FormSelect = forwardRef(({
    label,
    error,
    hint,
    children,
    className = "",
    ...rest
}, ref) => {

    return (

        <div>

            {
                label &&
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                    {label}
                </label>
            }

            <div className="relative">

                <select
                    ref={ref}
                    className={
                        `w-full appearance-none rounded-[14px] border text-sm text-slate-800 transition ` +
                        `px-3.5 py-2.5 pr-9 ` +
                        `focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ` +
                        `disabled:bg-slate-100 disabled:text-slate-400 ` +
                        (error ? "border-red-300 bg-red-50/40 " : "border-slate-300 bg-white ") +
                        className
                    }
                    {...rest}
                >
                    {children}
                </select>

                <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />

            </div>

            {
                error
                    ? <p className="text-red-500 text-xs mt-1.5">{error}</p>
                    : hint && <p className="text-slate-400 text-xs mt-1.5">{hint}</p>
            }

        </div>

    );

});

FormSelect.displayName = "FormSelect";

export default FormSelect;
