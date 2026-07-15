import { useEffect } from "react";
import socket from "../socket/socket";
import toast from "react-hot-toast";

const useAttendanceSocket = (onAttendanceMarked, onSessionUpdated) => {

    useEffect(() => {

        socket.on("connect", () => {

            console.log("🟢 Connected:", socket.id);

        });

        socket.on("attendanceMarked", (attendance) => {

            console.log("⚡ Live Attendance:", attendance);

            toast.success(

                `${attendance.student.name} marked present`

            );

            if (onAttendanceMarked) {

                onAttendanceMarked(attendance);

            }

        });

        socket.on("sessionUpdated", (session) => {

            console.log("⚡ Session Updated:", session);

            if (onSessionUpdated) {

                onSessionUpdated(session);

            }

        });

        socket.on("disconnect", () => {

            console.log("🔴 Socket Disconnected");

        });

        return () => {

            socket.off("attendanceMarked");

            socket.off("sessionUpdated");

            socket.off("connect");

            socket.off("disconnect");

        };

    }, [onAttendanceMarked, onSessionUpdated]);

};

export default useAttendanceSocket;