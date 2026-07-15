import { useMemo, useState } from "react";

/**
 * Client-side sort + pagination for a table component. The table
 * still receives its full filtered array as a prop exactly as before
 * (e.g. `students`) - this hook just slices/orders it for display, so
 * no page's data-fetching or filtering logic has to change.
 *
 * `getSortValue(row, field)` returns the comparable value for a given
 * sort field; the table decides what fields are sortable by what it
 * passes to `toggleSort`.
 */
const useDataTable = (data, { pageSize = 8, getSortValue } = {}) => {

    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);

    const sorted = useMemo(() => {

        if (!sortField || !getSortValue) return data;

        const withValues = data.map((row) => [row, getSortValue(row, sortField)]);

        withValues.sort(([, av], [, bv]) => {

            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;

            let cmp;
            if (typeof av === "number" && typeof bv === "number") {
                cmp = av - bv;
            } else {
                cmp = String(av).localeCompare(String(bv));
            }

            return sortDir === "asc" ? cmp : -cmp;

        });

        return withValues.map(([row]) => row);

    }, [data, sortField, sortDir, getSortValue]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    const rows = useMemo(() => {
        const startIdx = (safePage - 1) * pageSize;
        return sorted.slice(startIdx, startIdx + pageSize);
    }, [sorted, safePage, pageSize]);

    const toggleSort = (field) => {

        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }

        setPage(1);

    };

    return {
        rows,
        page: safePage,
        setPage,
        totalPages,
        pageSize,
        total: sorted.length,
        sortField,
        sortDir,
        toggleSort
    };

};

export default useDataTable;
