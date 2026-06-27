import tkinter as tk
from tkinter import ttk
import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
SELECT
    student_name,
    subject,
    COUNT(*) AS total_classes,
    SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present_classes
FROM attendance
GROUP BY student_name, subject
""")

rows = cursor.fetchall()
conn.close()

root = tk.Tk()
root.title("Attendance Shortage Report")
root.geometry("700x450")

title = tk.Label(
    root,
    text="Students Below 75% Attendance",
    font=("Arial", 16, "bold")
)
title.pack(pady=10)

columns = ("Student", "Subject", "Present", "Total", "Percentage")

tree = ttk.Treeview(root, columns=columns, show="headings")

for col in columns:
    tree.heading(col, text=col)
    tree.column(col, width=130)

tree.pack(fill="both", expand=True, padx=10, pady=10)

for student, subject, total, present in rows:

    if present is None:
        present = 0

    percentage = round((present / total) * 100, 2)

    if percentage < 75:

        tree.insert(
            "",
            tk.END,
            values=(
                student,
                subject,
                present,
                total,
                f"{percentage}%"
            )
        )

root.mainloop()