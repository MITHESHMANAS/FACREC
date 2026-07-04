import api from "./api";

export const getStudents = async () => {
    const { data } = await api.get("/students");
    return data;
};

export const createStudent = async (student) => {
    const { data } = await api.post("/students", student);
    return data;
};

export const updateStudent = async (id, student) => {
    const { data } = await api.put(`/students/${id}`, student);
    return data;
};

export const deleteStudent = async (id) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
};