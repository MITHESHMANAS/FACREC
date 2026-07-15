import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/authService";

const AuthContext = createContext();

// getProfile() (called on every page load/refresh) only returns
// { id, role } - the backend's login() response includes name and
// email too, but getProfile() drops them. Since the backend is
// frozen, name/email are cached here at login time and re-merged
// into whatever getProfile() returns on refresh, so "Welcome back,
// there" and a blank sidebar name don't reappear after an F5.
const USER_META_KEY = "facrec_user_meta";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getProfile();

                let meta = {};

                try {
                    meta = JSON.parse(localStorage.getItem(USER_META_KEY)) || {};
                } catch {
                    meta = {};
                }

                setUser({ ...meta, ...data.user });
            } catch (error) {
                console.error(error);
                localStorage.removeItem("token");
                localStorage.removeItem(USER_META_KEY);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

const loginUser = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem(
        USER_META_KEY,
        JSON.stringify({ name: user?.name, email: user?.email })
    );
    setUser(user);
};

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem(USER_META_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);