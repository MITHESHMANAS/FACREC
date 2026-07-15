import { FaSearch } from "react-icons/fa";

const SearchBar = ({ value, onChange, placeholder = "Search by name, roll no or email..." }) => {
    return (
        <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-[14px] border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition text-sm"
            />
        </div>
    );
};

export default SearchBar;
