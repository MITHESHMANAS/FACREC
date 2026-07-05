import api from "./api";

export const getSessions = async () => {
    const { data } = await api.get("/sessions");
    return data;
};

export const createSession = async (session) => {
    const { data } = await api.post("/sessions", session);
    return data;
};

export const updateSession = async (id, session) => {
    const { data } = await api.put(`/sessions/${id}`, session);
    return data;
};

export const deleteSession = async (id) => {
    const { data } = await api.delete(`/sessions/${id}`);
    return data;
};

export const startSession = async (id) => {
    const { data } = await api.patch(`/sessions/${id}/start`);
    return data;
};

export const completeSession = async (id) => {
    const { data } = await api.patch(`/sessions/${id}/complete`);
    return data;
};