import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Faculty from "../pages/Faculty";
import Subjects from "../pages/Subjects";
import Sessions from "../pages/Sessions";
import Attendance from "../pages/Attendance";
import Analytics from "../pages/Analytics";

import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students"
                    element={
                        <ProtectedRoute>
                            <Students />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty"
                    element={
                        <ProtectedRoute>
                            <Faculty />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/subjects"
                    element={
                        <ProtectedRoute>
                            <Subjects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sessions"
                    element={
                        <ProtectedRoute>
                            <Sessions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;