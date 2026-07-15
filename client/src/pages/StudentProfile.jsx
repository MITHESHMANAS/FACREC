import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import CardSkeleton from "../components/ui/CardSkeleton";

import AppLayout from "../layouts/AppLayout";

import {
    FaClipboardList,
    FaCheckCircle,
    FaTimesCircle,
    FaPercentage
} from "react-icons/fa";

import ProfileHeader from "../components/ProfileHeader";
import KpiCard from "../components/ui/KpiCard";
import AttendanceHealth from "../components/AttendanceHealth";
import SubjectPerformance from "../components/SubjectPerformance";
import EnrolledSubjects from "../components/EnrolledSubjects";
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
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Unable to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [id]);

    if (loading) {
        return (
            <AppLayout>
                <div className="rounded-[20px] bg-slate-200 animate-pulse h-40 mb-6" />
                <CardSkeleton cards={3} />
            </AppLayout>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-screen font-semibold text-slate-600">
                Student not found.
            </div>
        );
    }

    return (
        <AppLayout>
            {/* Unified container block enforcing clean structural gaps */}
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-2">
                
                {/* 1. Core Profile Header Strip */}
                <ProfileHeader student={profile.student} />

                {/* 2. Symmetrical Metrics Grid Layer */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        index={0}
                        title="Total Classes"
                        value={profile.attendance.total}
                        icon={FaClipboardList}
                        tone="indigo"
                    />
                    <KpiCard
                        index={1}
                        title="Present"
                        value={profile.attendance.present}
                        icon={FaCheckCircle}
                        tone="emerald"
                    />
                    <KpiCard
                        index={2}
                        title="Absent"
                        value={profile.attendance.absent}
                        icon={FaTimesCircle}
                        tone="red"
                    />
                    <KpiCard
                        index={3}
                        title="Attendance %"
                        value={`${profile.attendance.percentage}%`}
                        icon={FaPercentage}
                        tone="amber"
                    />
                </div>

                {/* 3. Full-Width Attendance Health Dashboard Area (Circle chart removed) */}
                <div className="w-full">
                    <AttendanceHealth attendance={profile.attendance} />
                </div>

                {/* 4. Enrolled Curricular Academic Tags */}
                <EnrolledSubjects subjects={profile.enrolledSubjects} />

                {/* 5. Subject Wise Performance Progress Bars */}
                <SubjectPerformance subjects={profile.subjects} />

                {/* 6. Lower Activity & Authentication logs */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <AttendanceHistory history={profile.history} />
                    <RecognitionTimeline history={profile.history} />
                </div>

            </div>
        </AppLayout>
    );
};

export default StudentProfile;