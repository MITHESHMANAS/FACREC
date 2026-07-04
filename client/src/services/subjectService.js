import api from "./api";

export const getSubjects = async () => {
    const { data } = await api.get("/subjects");
    return data;
};

export const createSubject = async (subject) => {
    const { data } = await api.post("/subjects", subject);
    return data;
};

export const updateSubject = async (id, subject) => {
    const { data } = await api.put(`/subjects/${id}`, subject);
    return data;
};

export const deleteSubject = async (id) => {
    const { data } = await api.delete(`/subjects/${id}`);
    return data;
};