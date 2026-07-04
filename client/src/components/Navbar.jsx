import { useAuth } from "../context/AuthContext";

const Navbar = () => {

    const { user } = useAuth();
    {user?.role === "admin" && (

    <button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
    >
        + Add Student
    </button>

)}

    return (

        <header className="bg-white shadow px-8 py-5 flex justify-between">

            <h2 className="text-2xl font-bold">

                Dashboard

            </h2>

            <div className="text-right">

                <p className="font-semibold">

                    {user?.role?.toUpperCase()}

                </p>

                <p className="text-gray-500">

                    {user?.id}

                </p>

            </div>

        </header>

    );

};

export default Navbar;