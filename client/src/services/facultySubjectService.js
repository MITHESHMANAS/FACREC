import api from "./api";

export const getAssignments = async (filters = {}) => {
    const params = {};
    if (filters.faculty) params.faculty = filters.faculty;
    if (filters.subject) params.subject = filters.subject;

    const { data } = await api.get("/faculty-subjects", { params });
    return data;
};

export const assignSubject = async (payload) => {
    const { data } = await api.post("/faculty-subjects", payload);
    return data;
};

export const removeAssignment = async (id) => {
    const { data } = await api.patch(`/faculty-subjects/${id}/remove`);
    return data;
};

// Subjects the logged-in faculty account is actually assigned to.
// Falls back gracefully (empty list) if the account has no linked
// Faculty profile yet - callers should treat that as "no subjects"
// rather than a hard error.
export const getMySubjects = async () => {
    const { data } = await api.get("/faculty-subjects/mine");
    return data;
};
