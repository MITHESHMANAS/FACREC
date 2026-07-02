import api from "./api";

export const getFaculty = async () => {

    const response = await api.get("/faculty");

    return response.data;

};

export const createFaculty = async (faculty) => {

    const response = await api.post("/faculty", faculty);

    return response.data;

};