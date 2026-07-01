import tkinter as tk
import os

from dashboard_stats import get_stats
from subject_config import CURRENT_SUBJECT


def open_module(filename):
    os.system(f"python {filename}")


students, attendance, overall, shortage = get_stats()

root = tk.Tk()
root.title("FACREC Dashboard")
root.geometry("600x650")

tk.Label(
    root,
    text="FACREC Attendance System",
    font=("Arial", 20, "bold")
).pack(pady=20)

tk.Label(
    root,
    text=f"Total Students : {students}",
    font=("Arial", 12)
).pack()

tk.Label(
    root,
    text=f"Today's Attendance : {attendance}",
    font=("Arial", 12)
).pack()

tk.Label(
    root,
    text=f"Current Subject : {CURRENT_SUBJECT}",
    font=("Arial", 12)
).pack(pady=(0, 20))

tk.Label(
    root,
    text=f"Overall Attendance : {overall}%",
    font=("Arial", 12)
).pack()

tk.Label(
    root,
    text=f"Students Below 75% : {shortage}",
    font=("Arial", 12)
).pack(pady=(0, 20))

buttons = [
    ("Register Student", "register_student.py"),
    ("Student Profile", "student_profile.py"),
    ("Start Attendance", "face_recognition.py"),
    ("View Students", "view_students.py"),
    ("View Attendance", "view_attendance.py"),
    ("Attendance Report", "attendance_report.py"),
    ("Attendance Percentage", "attendance_percentage_gui.py"),
    ("Attendance Shortage", "attendance_shortage.py"),
    ("Analytics", "analytics.py"),
    ("Attendance Pie Chart", "attendance_pie_chart.py"),
    ("Attendance Bar Chart", "attendance_bar_chart.py"),
]

for text, file in buttons:

    tk.Button(
        root,
        text=text,
        width=30,
        height=2,
        command=lambda f=file: open_module(f)
    ).pack(pady=5)

tk.Button(
    root,
    text="Exit",
    width=30,
    height=2,
    command=root.destroy
).pack(pady=20)

root.mainloop()