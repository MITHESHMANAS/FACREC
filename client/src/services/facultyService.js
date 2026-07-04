import api from "./api";

export const getFaculty = async () => {
    const { data } = await api.get("/faculty");
    return data;
};

export const createFaculty = async (faculty) => {
    const { data } = await api.post("/faculty", faculty);
    return data;
};

export const updateFaculty = async (id, faculty) => {
    const { data } = await api.put(`/faculty/${id}`, faculty);
    return data;
};

export const deleteFaculty = async (id) => {
    const { data } = await api.delete(`/faculty/${id}`);
    return data;
};