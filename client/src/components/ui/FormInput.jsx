import { forwardRef } from "react";

/**
 * Drop-in replacement for a hand-styled `<input>` + `<label>` pair.
 * Spread `register("field")` directly onto it - react-hook-form's
 * returned `ref` is captured by forwardRef, and `name`/`onChange`/
 * `onBlur` pass through via `...rest` exactly as before.
 */
const FormInput = forwardRef(({
    label,
    error,
    icon: Icon,
    hint,
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

                {
                    Icon &&
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                }

                <input
                    ref={ref}
                    className={
                        `w-full rounded-[14px] border text-sm text-slate-800 transition ` +
                        `focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ` +
                        `disabled:bg-slate-100 disabled:text-slate-400 ` +
                        `placeholder:text-slate-400 ` +
                        (Icon ? "pl-10 pr-3.5 py-2.5 " : "px-3.5 py-2.5 ") +
                        (error ? "border-red-300 bg-red-50/40 " : "border-slate-300 bg-white ") +
                        className
                    }
                    {...rest}
                />

            </div>

            {
                error
                    ? <p className="text-red-500 text-xs mt-1.5">{error}</p>
                    : hint && <p className="text-slate-400 text-xs mt-1.5">{hint}</p>
            }

        </div>

    );

});

FormInput.displayName = "FormInput";

export default FormInput;
