import { FaEdit, FaTrash } from "react-icons/fa";

const ActionButtons = ({ onEdit, onDelete }) => {
    return (
        <div className="flex gap-2 justify-center">

            <button
                onClick={onEdit}
                aria-label="Edit"
                title="Edit"
                className="w-8 h-8 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 flex items-center justify-center transition"
            >
                <FaEdit className="text-xs" />
            </button>

            <button
                onClick={onDelete}
                aria-label="Delete"
                title="Delete"
                className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 flex items-center justify-center transition"
            >
                <FaTrash className="text-xs" />
            </button>

        </div>
    );
};

export default ActionButtons;
