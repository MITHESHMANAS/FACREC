import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * Page controls for any table using `usePagination`. Purely
 * presentational - `page` is 1-indexed, `totalPages` is at least 1.
 */
const Pagination = ({ page, totalPages, total, pageSize, onPageChange }) => {

    if (totalPages <= 1) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return (

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">

            <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{start}-{end}</span> of{" "}
                <span className="font-semibold text-slate-700">{total}</span>
            </p>

            <div className="flex items-center gap-1.5">

                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <FaChevronLeft className="text-xs" />
                </button>

                <span className="text-xs font-medium text-slate-500 px-2">
                    Page {page} of {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <FaChevronRight className="text-xs" />
                </button>

            </div>

        </div>

    );

};

export default Pagination;
