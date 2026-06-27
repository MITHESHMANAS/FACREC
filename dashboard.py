import tkinter as tk
import os

from dashboard_stats import get_stats

# Get Dashboard Statistics
students, attendance, overall, shortage = get_stats()

root = tk.Tk()

root.title("FACREC Dashboard")
root.geometry("600x650")

# ==========================
# TITLE
# ==========================

title = tk.Label(
    root,
    text="FACREC Attendance System",
    font=("Arial", 20, "bold")
)

title.pack(pady=20)

# ==========================
# LIVE STATISTICS
# ==========================

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
    text="Current Subject : AI",
    font=("Arial", 12)
).pack(pady=(0, 20))

# ==========================
# FUNCTIONS
# ==========================

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

def pie_chart():
    os.system("python attendance_pie_chart.py")

def bar_chart():
    os.system("python attendance_bar_chart.py")
    
def attendance_percentage():
    os.system("python attendance_percentage_gui.py")
    
def attendance_shortage():
    os.system("python attendance_shortage.py")

def student_profile():
    os.system("python student_profile.py")
    
# ==========================
# BUTTONS
# ==========================

tk.Button(
    root,
    text="Register Student",
    width=30,
    height=2,
    command=register_student
).pack(pady=5)
tk.Button(
    root,
    text="Student Profile",
    width=30,
    height=2,
    command=student_profile
).pack(pady=5)

tk.Label(
    root,
    text=f"Overall Attendance : {overall}%",
    font=("Arial", 12)
).pack()

tk.Label(
    root,
    text=f"Students Below 75% : {shortage}",
    font=("Arial", 12)
).pack()

tk.Button(
    root,
    text="Start Attendance",
    width=30,
    height=2,
    command=start_attendance
).pack(pady=5)

tk.Button(
    root,
    text="View Students",
    width=30,
    height=2,
    command=view_students
).pack(pady=5)

tk.Button(
    root,
    text="View Attendance",
    width=30,
    height=2,
    command=view_attendance
).pack(pady=5)

tk.Button(
    root,
    text="Attendance Report",
    width=30,
    height=2,
    command=attendance_report
).pack(pady=5)

tk.Button(
    root,
    text="Attendance Percentage",
    width=30,
    height=2,
    command=attendance_percentage
).pack(pady=5)

tk.Button(
    root,
    text="Attendance Shortage",
    width=30,
    height=2,
    command=attendance_shortage
).pack(pady=5)

tk.Button(
    root,
    text="Analytics",
    width=30,
    height=2,
    command=analytics
).pack(pady=5)

tk.Button(
    root,
    text="Exit",
    width=30,
    height=2,
    command=root.destroy
).pack(pady=20)

tk.Button(
    root,
    text="Attendance Pie Chart",
    width=30,
    height=2,
    command=pie_chart
).pack(pady=5)

tk.Button(
    root,
    text="Attendance Bar Chart",
    width=30,
    height=2,
    command=bar_chart
).pack(pady=5)

root.mainloop()