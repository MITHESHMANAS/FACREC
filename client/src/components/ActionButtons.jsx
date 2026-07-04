import { FaEdit, FaTrash } from "react-icons/fa";

const ActionButtons = ({ onEdit, onDelete }) => {
    return (
        <div className="flex gap-3 justify-center">

            <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800"
            >
                <FaEdit />
            </button>

            <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800"
            >
                <FaTrash />
            </button>

        </div>
    );
};

export default ActionButtons;