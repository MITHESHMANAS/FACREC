import tkinter as tk
from tkinter import messagebox
import sqlite3

DB = "attendance.db"

def search_student():
    name = entry.get().strip()

    if not name:
        messagebox.showerror("Error", "Enter Student Name")
        return

    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT name, roll_no, branch, semester, email
    FROM students
    WHERE name=?
    """, (name,))

    student = cursor.fetchone()

    if not student:
        messagebox.showerror("Error", "Student Not Found")
        conn.close()
        return

    cursor.execute("""
    SELECT
        subject,
        COUNT(*),
        SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)
    FROM attendance
    WHERE student_name=?
    GROUP BY subject
    """, (name,))

    attendance = cursor.fetchall()

    conn.close()

    info.config(
        text=f"""
Name      : {student[0]}
Roll No   : {student[1]}
Branch    : {student[2]}
Semester  : {student[3]}
Email     : {student[4]}
"""
    )

    summary.delete("1.0", tk.END)

    total_present = 0
    total_classes = 0

    summary.insert(tk.END, "Subject\tPercentage\n\n")

    for subject, total, present in attendance:

        if present is None:
            present = 0

        percentage = round((present/total)*100,2)

        total_present += present
        total_classes += total

        summary.insert(
            tk.END,
            f"{subject}\t{percentage}%\n"
        )

    if total_classes:

        overall = round(
            (total_present/total_classes)*100,
            2
        )

        summary.insert(
            tk.END,
            f"\nOverall Attendance : {overall}%"
        )


root = tk.Tk()

root.title("Student Profile")

root.geometry("500x550")

tk.Label(
    root,
    text="Student Profile",
    font=("Arial",18,"bold")
).pack(pady=10)

entry = tk.Entry(root,font=("Arial",12),width=25)
entry.pack()

tk.Button(
    root,
    text="Search",
    command=search_student
).pack(pady=10)

info = tk.Label(
    root,
    justify="left",
    font=("Arial",12)
)

info.pack()

summary = tk.Text(
    root,
    width=45,
    height=15,
    font=("Arial",11)
)

summary.pack()

root.mainloop()