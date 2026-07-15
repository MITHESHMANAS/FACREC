// Central place for what color a given status word means across the
// whole app. Add new statuses here rather than picking colors ad hoc
// in individual pages - that's how "everything is red" happens.
const STATUS_STYLES = {

    // attendance
    Present: "bg-emerald-100 text-emerald-700",
    Absent: "bg-red-100 text-red-700",

    // recognition
    RECOGNIZED: "bg-emerald-100 text-emerald-700",
    UNKNOWN: "bg-slate-200 text-slate-700",

    // sessions
    SCHEDULED: "bg-slate-200 text-slate-700",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    ENDED: "bg-blue-100 text-blue-700",

    // enrollment / assignment
    ACTIVE_ENROLLMENT: "bg-emerald-100 text-emerald-700",
    REMOVED: "bg-slate-200 text-slate-600",
    TRANSFERRED: "bg-amber-100 text-amber-700",
    INACTIVE: "bg-slate-200 text-slate-600"

};

const DEFAULT_STYLE = "bg-slate-200 text-slate-700";

/**
 * Renders any status word as a consistently-colored pill.
 * whitespace-nowrap + inline-block are load-bearing here: without them
 * a status like "Present" can wrap onto a second line inside a narrow
 * table cell, and the pill's own rounded corners clip that second
 * line - it renders as "Presen" with the "t" invisible.
 */
const Badge = ({ status, label }) => {

    const style = STATUS_STYLES[status] || DEFAULT_STYLE;

    return (

        <span
            className={
                `inline-block whitespace-nowrap px-3 py-1 rounded-full ` +
                `text-xs font-semibold ${style}`
            }
        >

            {label || status}

        </span>

    );

};

export default Badge;
