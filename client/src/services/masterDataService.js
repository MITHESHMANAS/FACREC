import api from "./api";

export const getSubjects = async () => {
    const { data } = await api.get("/subjects");
    return data.subjects;
};