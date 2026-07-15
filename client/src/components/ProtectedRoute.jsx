import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({

    children,

    roles = []

}) => {

    const {

        user,

        loading

    } = useAuth();

    if (loading) {

        return (

            <div className="flex justify-center items-center h-screen">

                <h2 className="text-2xl font-semibold">

                    Loading...

                </h2>

            </div>

        );

    }

    // User not logged in
    if (!user) {

        return <Navigate to="/login" replace />;

    }

    // Role check
    if (

        roles.length > 0 &&

        !roles.includes(user.role)

    ) {

        return (

            <div className="flex justify-center items-center h-screen bg-slate-100">

                <div className="bg-white p-10 rounded-[20px] shadow-xl text-center">

                    <h1 className="text-5xl font-bold text-red-600">

                        403

                    </h1>

                    <h2 className="text-2xl font-semibold mt-4">

                        Access Denied

                    </h2>

                    <p className="text-gray-500 mt-2">

                        You don't have permission to access this page.

                    </p>

                </div>

            </div>

        );

    }

    return children;

};

export default ProtectedRoute;