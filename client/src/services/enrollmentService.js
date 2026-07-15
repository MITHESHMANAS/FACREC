import api from "./api";

export const getEnrollments = async (filters = {}) => {
    const params = {};
    if (filters.student) params.student = filters.student;
    if (filters.subject) params.subject = filters.subject;

    const { data } = await api.get("/enrollments", { params });
    return data;
};

export const enrollStudent = async (payload) => {
    const { data } = await api.post("/enrollments", payload);
    return data;
};

export const removeEnrollment = async (id) => {
    const { data } = await api.patch(`/enrollments/${id}/remove`);
    return data;
};
