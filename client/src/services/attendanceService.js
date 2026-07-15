import api from "./api";

export const getAttendance = async (filters = {}) => {
    const params = {};
    if (filters.session) params.session = filters.session;

    const { data } = await api.get("/attendance", { params });
    return data;
};

export const markAttendance = async (attendance) => {
    const { data } = await api.post("/attendance", attendance);
    return data;
};

export const deleteAttendance = async (id) => {
    const { data } = await api.delete(`/attendance/${id}`);
    return data;
};