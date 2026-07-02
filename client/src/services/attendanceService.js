import api from "./api";

export const getAttendance = async () => {

    const response = await api.get("/attendance");

    return response.data;

};

export const markAttendance = async (attendance) => {

    const response = await api.post("/attendance", attendance);

    return response.data;

};