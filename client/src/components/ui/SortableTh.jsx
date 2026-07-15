import { FaChevronUp, FaChevronDown, FaSort } from "react-icons/fa";

/**
 * Drop-in replacement for a plain `<th>` when a column should be
 * sortable. `field` is whatever string `useDataTable`'s
 * `getSortValue(row, field)` expects; pass nothing for a non-sortable
 * header and it renders as a plain `<th>`.
 */
const SortableTh = ({ children, field, sortField, sortDir, onSort, align = "left", className = "" }) => {

    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    if (!field) {
        return (
            <th className={`px-6 py-4 font-semibold ${alignClass} ${className}`}>
                {children}
            </th>
        );
    }

    const active = sortField === field;

    return (
        <th className={`px-6 py-4 font-semibold ${alignClass} ${className}`}>
            <button
                onClick={() => onSort(field)}
                className={
                    `inline-flex items-center gap-1.5 hover:text-slate-800 transition ` +
                    (active ? "text-slate-800" : "text-slate-500")
                }
            >
                {children}
                {
                    active
                        ? (sortDir === "asc" ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />)
                        : <FaSort className="text-[10px] opacity-30" />
                }
            </button>
        </th>
    );

};

export default SortableTh;
