import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import {
    FaCalendarCheck,
    FaBook,
    FaChalkboardTeacher,
    FaLayerGroup,
    FaGraduationCap
} from "react-icons/fa";

import { getActiveSession } from "../../../services/dashboardAnalyticsService";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import Badge from "../../Badge";

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm shrink-0">
            <Icon />
        </span>
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="font-semibold text-slate-700">{value}</p>
        </div>
    </div>
);

const ActiveSessionWidget = () => {

    const [session, setSession] = useState(null);

    const [loading, setLoading] = useState(true);

    const loadSession = async () => {

        try {

            const data = await getActiveSession();

            setSession(data.session);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadSession();

    }, []);

    return (

        <Card>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                        <FaCalendarCheck />
                    </span>
                    Active Session
                </h2>
                {
                    session &&
                    <Badge status="ACTIVE" />
                }
            </div>

            {
                loading
                    ?
                    <div className="flex justify-center py-10">
                        <BeatLoader color="#4f46e5" />
                    </div>
                    :
                    !session
                        ?
                        <EmptyState
                            icon={FaCalendarCheck}
                            title="No active session"
                            message="Start a session to see it here."
                        />
                        :
                        <div className="space-y-4">
                            <InfoRow icon={FaBook} label="Subject" value={session.subject?.name} />
                            <InfoRow icon={FaChalkboardTeacher} label="Faculty" value={session.faculty} />
                            <InfoRow icon={FaLayerGroup} label="Branch" value={session.branch} />
                            <InfoRow icon={FaGraduationCap} label="Semester" value={session.semester} />
                        </div>
            }

        </Card>

    );

};

export default ActiveSessionWidget;
