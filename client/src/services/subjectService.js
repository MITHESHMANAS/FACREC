import api from "./api";

export const getSubjects = async () => {

    const response = await api.get("/subjects");

    return response.data;

};

export const createSubject = async (subject) => {

    const response = await api.post("/subjects", subject);

    return response.data;

};