import api from "./api";

export const login = async (credentials) => {

    const { data } = await api.post(
        "/auth/login",
        credentials
    );

    return data;

};

export const getProfile = async () => {

    const { data } = await api.get(
        "/auth/profile"
    );

    return data;

};