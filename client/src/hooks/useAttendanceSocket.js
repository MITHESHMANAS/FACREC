import { useEffect } from "react";
import socket from "../socket/socket";
import toast from "react-hot-toast";

const useAttendanceSocket = (onAttendanceMarked) => {

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

        socket.on("disconnect", () => {

            console.log("🔴 Socket Disconnected");

        });

        return () => {

            socket.off("attendanceMarked");

            socket.off("connect");

            socket.off("disconnect");

        };

    }, [onAttendanceMarked]);

};

export default useAttendanceSocket;