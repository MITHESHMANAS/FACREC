const SearchBar = ({ value, onChange }) => {
    return (
        <input
            type="text"
            placeholder="Search by name, roll no or email..."
            value={value}
            onChange={onChange}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
    );
};

export default SearchBar;