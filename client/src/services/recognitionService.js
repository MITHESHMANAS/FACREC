import api from "./api";

export const getEngineStatus = async () => {

    const { data } = await api.get("/engine/health");

    return data;

};

export const startRecognition = async () => {

    const { data } = await api.post("/engine/start");

    return data;

};