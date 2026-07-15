/**
 * Shimmering placeholder for card-grid / dashboard-style loading
 * states (Analytics summary cards, Reports report cards, etc.) where
 * TableSkeleton's row layout doesn't fit.
 */
const CardSkeleton = ({ cards = 3 }) => {

    return (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {
                Array.from({ length: cards }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6"
                    >
                        <div
                            className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse mb-4"
                            style={{ animationDelay: `${i * 60}ms` }}
                        />
                        <div
                            className="h-3 w-2/3 rounded-full bg-slate-200 animate-pulse mb-3"
                            style={{ animationDelay: `${i * 60 + 40}ms` }}
                        />
                        <div
                            className="h-3 w-1/2 rounded-full bg-slate-100 animate-pulse"
                            style={{ animationDelay: `${i * 60 + 80}ms` }}
                        />
                    </div>
                ))
            }
        </div>

    );

};

export default CardSkeleton;
