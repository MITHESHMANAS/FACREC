import { FaSearch } from "react-icons/fa";

const SearchBar = ({
    value,
    onChange,
    placeholder = "Search students...",
    className = "",
}) => {
    return (
        <div className={`relative w-full ${className}`}>
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="
                    w-full
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    !pl-11
                    pr-4
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    focus:bg-white
                    focus:outline-none
                    focus:ring-4
                    focus:ring-indigo-50
                    focus:border-indigo-400
                    transition
                "
            />
        </div>
    );
};

export default SearchBar;