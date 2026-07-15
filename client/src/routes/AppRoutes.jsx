import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Faculty from "../pages/Faculty";
import Subjects from "../pages/Subjects";
import Sessions from "../pages/Sessions";
import Attendance from "../pages/Attendance";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import StudentProfile from "../pages/StudentProfile";
import Recognition from "../pages/Recognition";
import FacultyAssignments from "../pages/FacultyAssignments";
import Enrollments from "../pages/Enrollments";

import ProtectedRoute from "../components/ProtectedRoute";
import RecognitionHistory from "../pages/RecognitionHistory";
const AppRoutes = () => {

    return (

        <BrowserRouter>

            <Routes>

                {/* Public Route */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Dashboard */}

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Students */}

                <Route
                    path="/students"
                    element={
                        <ProtectedRoute>
                            <Students />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students/:id"
                    element={
                        <ProtectedRoute>
                            <StudentProfile />
                        </ProtectedRoute>
                    }
                />

                {/* Faculty */}

                <Route
                    path="/faculty"
                    element={
                        <ProtectedRoute>
                            <Faculty />
                        </ProtectedRoute>
                    }
                />

                {/* Subjects */}

                <Route
                    path="/subjects"
                    element={
                        <ProtectedRoute>
                            <Subjects />
                        </ProtectedRoute>
                    }
                />

                {/* Enrollments (admin only) */}

                <Route
                    path="/enrollments"
                    element={
                        <ProtectedRoute roles={["admin"]}>
                            <Enrollments />
                        </ProtectedRoute>
                    }
                />

                {/* Faculty Subject Assignments (admin only) */}

                <Route
                    path="/faculty-assignments"
                    element={
                        <ProtectedRoute roles={["admin"]}>
                            <FacultyAssignments />
                        </ProtectedRoute>
                    }
                />

                {/* Sessions */}

                <Route
                    path="/sessions"
                    element={
                        <ProtectedRoute>
                            <Sessions />
                        </ProtectedRoute>
                    }
                />

                {/* Attendance */}

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                {/* Analytics */}

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />

                {/* Reports */}

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />

                {/* Recognition */}

                <Route
                    path="/recognition"
                    element={
                        <ProtectedRoute>
                            <Recognition />
                        </ProtectedRoute>
                    }
                />
                <Route
    path="/recognition-history"
    element={
        <ProtectedRoute
            roles={["admin","faculty"]}
        >
            <RecognitionHistory />
        </ProtectedRoute>
    }
/>

            </Routes>

        </BrowserRouter>

    );

};

export default AppRoutes;