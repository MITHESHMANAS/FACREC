import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import ProfileHeader from "../components/ProfileHeader";
import AttendanceProgress from "../components/AttendanceProgress";
import SubjectPerformance from "../components/SubjectPerformance";
import AttendanceHistory from "../components/AttendanceHistory";

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

        catch {

            toast.error("Unable to load profile");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadProfile();

    }, []);

    if (loading) {

        return (

            <div className="flex justify-center items-center h-screen">

                Loading...

            </div>

        );

    }

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <div className="p-8 space-y-6">

                    <ProfileHeader

                        student={profile.student}

                        attendance={profile.attendance}

                    />

                    <AttendanceProgress

                        attendance={profile.attendance}

                    />

                    <SubjectPerformance

                        subjects={profile.subjects}

                    />

                    <AttendanceHistory

                        history={profile.history}

                    />

                </div>

            </div>

        </div>

    );

};

export default StudentProfile;