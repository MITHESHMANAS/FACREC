import { useNavigate } from "react-router-dom";
import {
    FaUserPlus,
    FaPlayCircle,
    FaBook,
    FaChartBar
} from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";

const QuickActions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const adminActions = [
        {
            label: "Register Student",
            icon: <FaUserPlus />,
            onClick: () => navigate("/students")
        },
        {
            label: "Manage Subjects",
            icon: <FaBook />,
            onClick: () => navigate("/subjects")
        },
        {
            label: "Create Session",
            icon: <FaPlayCircle />,
            onClick: () => navigate("/sessions")
        },
        {
            label: "View Analytics",
            icon: <FaChartBar />,
            onClick: () => navigate("/analytics")
        }
    ];

    const facultyActions = [
        {
            label: "My Sessions",
            icon: <FaPlayCircle />,
            onClick: () => navigate("/sessions")
        },
        {
            label: "View Analytics",
            icon: <FaChartBar />,
            onClick: () => navigate("/analytics")
        }
    ];

    const actions = user?.role === "admin" ? adminActions : facultyActions;

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-5">
                Quick Actions
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 py-5 px-5 min-h-[118px] text-center text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out"
                    >
                        <span className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg shrink-0 transition-colors duration-200">
                            {action.icon}
                        </span>
                        
                        <span className="leading-tight truncate max-w-full">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;