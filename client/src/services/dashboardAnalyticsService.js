import api from "./api";

export const getRecentRecognition = async () => {

    const { data } = await api.get(

        "/dashboard/recent-recognition"

    );

    return data;

};

export const getActiveSession = async () => {

    const { data } = await api.get(

        "/dashboard/active-session"

    );

    return data;

};

export const getTopPerformers = async () => {

    const { data } = await api.get(

        "/dashboard/top-performers"

    );

    return data;

};

export const getAttendanceTrend = async () => {

    const { data } = await api.get(

        "/dashboard/attendance-trend"

    );

    return data;

};