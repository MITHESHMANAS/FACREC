import api from "./api";

export const getStudentProfile = async (id) => {

    const { data } = await api.get(
        `/student-profile/${id}`
    );

    return data;

};