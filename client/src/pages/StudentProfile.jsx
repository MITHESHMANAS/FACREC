import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import ProfileHeader from "../components/ProfileHeader";
import AttendanceProgress from "../components/AttendanceProgress";
import AttendanceHealth from "../components/AttendanceHealth";
import SubjectPerformance from "../components/SubjectPerformance";
import AttendanceHistory from "../components/AttendanceHistory";
import RecognitionTimeline from "../components/RecognitionTimeline";

import { getStudentProfile } from "../services/studentProfileService";

const StudentProfile = () => {

    const { id } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {

        try {

            const data = await getStudentProfile(id);

            setProfile(data.profile);

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                "Unable to load profile"

            );

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadProfile();

    }, [id]);

    if (loading) {

        return (

            <div className="flex justify-center items-center h-screen">

                <BeatLoader color="#4f46e5" />

            </div>

        );

    }

    if (!profile) {

        return (

            <div className="flex justify-center items-center h-screen">

                Student not found.

            </div>

        );

    }

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <div className="p-8">

                    <div className="mb-8">

                        <h1 className="text-4xl font-bold">

                            Student Profile

                        </h1>

                        <p className="text-gray-500 mt-2">

                            Attendance analytics and recognition insights.

                        </p>

                    </div>

                    <ProfileHeader
                        student={profile.student}
                        attendance={profile.attendance}
                    />

                    <div className="grid lg:grid-cols-2 gap-6 mt-8">

                        <AttendanceProgress
                            attendance={profile.attendance}
                        />

                        <AttendanceHealth
                            attendance={profile.attendance}
                        />

                    </div>

                    <div className="mt-8">

                        <SubjectPerformance
                            subjects={profile.subjects}
                        />

                    </div>

                    <div className="grid xl:grid-cols-2 gap-6 mt-8">

                        <AttendanceHistory
                            history={profile.history}
                        />

                        <RecognitionTimeline
                            history={profile.history}
                        />

                    </div>

                </div>

            </div>

        </div>

    );

};

export default StudentProfile;