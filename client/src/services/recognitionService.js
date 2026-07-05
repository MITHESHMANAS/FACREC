import api from "./api";

export const startRecognition = async () => {
    const { data } = await api.post("/recognition/start");
    return data;
};