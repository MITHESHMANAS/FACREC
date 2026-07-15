import { motion } from "framer-motion";

// Gradient chip backgrounds keyed by the same semantic colors already
// used across the app's Badge/Button variants, so a widget just picks
// a name instead of hand-typing a gradient string.
const GRADIENTS = {
    indigo: "from-indigo-500 to-indigo-700",
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-700",
    slate: "from-slate-500 to-slate-700"
};

/**
 * KPI stat card used across the dashboard widgets. `icon` takes a
 * component reference (e.g. FaUserGraduate, not <FaUserGraduate />),
 * `tone` picks the gradient, `trend` is optional (e.g. "+4% this week").
 */
const KpiCard = ({ title, value, icon: Icon, tone = "indigo", trend = null, subtitle = null, index = 0 }) => {
    const gradient = GRADIENTS[tone] || GRADIENTS.indigo;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="relative bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5 min-h-[118px] overflow-hidden hover:shadow-md transition-all duration-200 ease-out"
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />

            <div className="flex justify-between items-start h-full gap-4">
                
                {/* Left Section: Information-Dense Refined Stack */}
                <div className="flex flex-col min-w-0 space-y-1.5">
                    <p className="text-sm font-semibold tracking-wide text-slate-500 truncate">
                        {title}
                    </p>
                    <h2 className="text-[38px] font-bold tracking-tight leading-none text-slate-800">
                        {value}
                    </h2>
                    
                    {subtitle && (
                        <p className="text-xs text-slate-400 leading-relaxed truncate">
                            {subtitle}
                        </p>
                    )}

                    {trend && (
                        <p className="text-xs font-semibold text-emerald-600">
                            {trend}
                        </p>
                    )}
                </div>

                {/* Right Section: Balanced Aligned Icon Block */}
                {Icon && (
                    <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg shadow-sm`}>
                        <Icon />
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default KpiCard;