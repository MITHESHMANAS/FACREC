import tkinter as tk
from tkinter import messagebox

from services.student_service import get_student
from services.attendance_service import (
    get_student_attendance,
    get_overall_attendance,
)


def search_student():

    name = entry.get().strip()

    if not name:
        messagebox.showwarning(
            "Missing Information",
            "Please enter a student name."
        )
        return

    try:
        student = get_student(name)

    except Exception as e:
        messagebox.showerror(
            "Error",
            f"Unable to fetch student details.\n\n{e}"
        )
        return

    if not student:

        info.config(text="")
        summary.delete("1.0", tk.END)

        messagebox.showinfo(
            "Not Found",
            "Student not found."
        )

        return

    attendance = get_student_attendance(name)

    info.config(
        text=f"""
Name      : {student['name']}
Roll No   : {student['roll_no']}
Branch    : {student['branch']}
Semester  : {student['semester']}
Email     : {student['email']}
"""
    )

    summary.delete("1.0", tk.END)

    summary.insert(
        tk.END,
        "Subject\tPercentage\n\n"
    )

    if not attendance:

        summary.insert(
            tk.END,
            "No attendance records available."
        )

        return

    for subject, total, present in attendance:

        present = present or 0

        percentage = round(
            (present / total) * 100,
            2
        )

        summary.insert(
            tk.END,
            f"{subject}\t{percentage}%\n"
        )

    overall = get_overall_attendance(name)

    summary.insert(
        tk.END,
        f"\nOverall Attendance : {overall}%"
    )


root = tk.Tk()

root.title("Student Profile")
root.geometry("500x550")
root.resizable(False, False)

tk.Label(
    root,
    text="Student Profile",
    font=("Arial", 18, "bold")
).pack(pady=10)

entry = tk.Entry(
    root,
    font=("Arial", 12),
    width=25
)

entry.pack()

entry.bind("<Return>", lambda event: search_student())

tk.Button(
    root,
    text="Search",
    command=search_student
).pack(pady=10)

info = tk.Label(
    root,
    justify="left",
    font=("Arial", 12)
)

info.pack()

summary = tk.Text(
    root,
    width=45,
    height=15,
    font=("Arial", 11)
)

summary.pack()

root.mainloop()