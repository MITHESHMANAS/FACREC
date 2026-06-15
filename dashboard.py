import tkinter as tk
import os

root = tk.Tk()

root.title("FACREC Dashboard")
root.geometry("500x500")

title = tk.Label(
    root,
    text="FACREC Attendance System",
    font=("Arial", 18, "bold")
)

title.pack(pady=20)


def register_student():
    os.system("python register_student.py")


def start_attendance():
    os.system("python face_recognition.py")


def view_students():
    os.system("python view_students.py")


def view_attendance():
    os.system("python view_attendance.py")


def attendance_report():
    os.system("python attendance_report.py")

def analytics():
    os.system("python analytics.py")


tk.Button(
    root,
    text="Register Student",
    width=25,
    height=2,
    command=register_student
).pack(pady=5)

tk.Button(
    root,
    text="Start Attendance",
    width=25,
    height=2,
    command=start_attendance
).pack(pady=5)

tk.Button(
    root,
    text="View Students",
    width=25,
    height=2,
    command=view_students
).pack(pady=5)

tk.Button(
    root,
    text="View Attendance",
    width=25,
    height=2,
    command=view_attendance
).pack(pady=5)

tk.Button(
    root,
    text="Attendance Report",
    width=25,
    height=2,
    command=attendance_report
).pack(pady=5)

tk.Button(
    root,
    text="Exit",
    width=25,
    height=2,
    command=root.destroy
).pack(pady=20)

tk.Button(
    root,
    text="Analytics",
    width=25,
    height=2,
    command=analytics
).pack(pady=5)

root.mainloop()