/**
 * Shimmering placeholder rows shown while a data table is loading,
 * in place of a spinner that blocks the whole page. Row/column count
 * is configurable so it can roughly match the table it's standing in
 * for, but it never needs real data - it's pure layout.
 */
const TableSkeleton = ({ rows = 5, columns = 5, showHeader = true }) => {

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">

            {
                showHeader &&
                <div className="px-6 py-4 border-b border-slate-100 flex gap-6">
                    {
                        Array.from({ length: columns }).map((_, i) => (
                            <div
                                key={i}
                                className="h-3 rounded-full bg-slate-200 animate-pulse"
                                style={{ width: i === 0 ? "18%" : `${100 / columns - 4}%` }}
                            />
                        ))
                    }
                </div>
            }

            <div className="divide-y divide-slate-100">
                {
                    Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="px-6 py-4 flex items-center gap-6">
                            {
                                Array.from({ length: columns }).map((__, c) => (
                                    <div
                                        key={c}
                                        className="h-4 rounded-full bg-slate-100 animate-pulse"
                                        style={{
                                            width: c === 0 ? "18%" : `${100 / columns - 4}%`,
                                            animationDelay: `${(r * columns + c) * 40}ms`
                                        }}
                                    />
                                ))
                            }
                        </div>
                    ))
                }
            </div>

        </div>

    );

};

export default TableSkeleton;
