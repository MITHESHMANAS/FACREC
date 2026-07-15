/**
 * The one card container the whole app should use. Every hand-rolled
 * `<div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">`
 * scattered across pages is this component, just not using it yet.
 *
 * padding: "md" (default, p-6) | "sm" (p-4) | "lg" (p-8) | "none"
 * accent: optional Tailwind color class (e.g. "border-l-indigo-600")
 *   for the left-accent-border treatment used on a few highlight cards
 *   (e.g. Reports' "Active Session" banner).
 */
const PADDING = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
};

const Card = ({
    children,
    padding = "md",
    accent = null,
    hover = false,
    className = ""
}) => {

    return (

        <div
            className={
                `bg-white rounded-[20px] shadow-sm border border-slate-200 ` +
                `${PADDING[padding] || PADDING.md} ` +
                (accent ? `border-l-4 ${accent} ` : "") +
                (hover ? "transition-shadow hover:shadow-md " : "") +
                className
            }
        >

            {children}

        </div>

    );

};

export default Card;
