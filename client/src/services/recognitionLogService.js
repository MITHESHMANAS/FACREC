import api from "./api";

export const getRecognitionLogs = async () => {

    const { data } = await api.get(
        "/recognitions"
    );

    return data;

};

export const getRecentRecognitionLogs = async () => {

    const { data } = await api.get(
        "/recognitions/recent"
    );

    return data;

};

export const deleteRecognitionLog = async (id) => {

    const { data } = await api.delete(
        `/recognitions/${id}`
    );

    return data;

};