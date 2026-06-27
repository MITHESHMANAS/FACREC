import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3

DB_NAME = "attendance.db"


def search_student():
    student = entry.get().strip()

    if student == "":
        messagebox.showerror("Error", "Enter Student Name")
        return

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            subject,
            COUNT(*) as total,
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present
        FROM attendance
        WHERE student_name=?
        GROUP BY subject
    """, (student,))

    rows = cursor.fetchall()

    conn.close()

    for item in tree.get_children():
        tree.delete(item)

    if len(rows) == 0:
        messagebox.showinfo("Not Found", "No Attendance Found")
        overall_label.config(text="")
        shortage_label.config(text="")
        return

    total_present = 0
    total_classes = 0

    shortage_subjects = []

    for subject, total, present in rows:

        if present is None:
            present = 0

        percentage = round((present / total) * 100, 2)

        tree.insert(
            "",
            "end",
            values=(
                subject,
                present,
                total,
                f"{percentage}%"
            )
        )

        total_present += present
        total_classes += total

        if percentage < 75:
            shortage_subjects.append(
                f"{subject} ({percentage}%)"
            )

    overall = round((total_present / total_classes) * 100, 2)

    overall_label.config(
        text=f"Overall Attendance : {overall}%"
    )

    if shortage_subjects:

        shortage_label.config(
            text="⚠ Shortage : " + ", ".join(shortage_subjects),
            fg="red"
        )

    else:

        shortage_label.config(
            text="✅ Attendance is above 75%",
            fg="green"
        )


root = tk.Tk()

root.title("Attendance Percentage Report")
root.geometry("700x500")

title = tk.Label(
    root,
    text="Attendance Percentage Report",
    font=("Arial", 18, "bold")
)

title.pack(pady=15)

frame = tk.Frame(root)

frame.pack()

tk.Label(
    frame,
    text="Student Name :",
    font=("Arial", 12)
).grid(row=0, column=0, padx=10)

entry = tk.Entry(
    frame,
    width=25,
    font=("Arial", 12)
)

entry.grid(row=0, column=1)

tk.Button(
    frame,
    text="Search",
    command=search_student
).grid(row=0, column=2, padx=10)

columns = (
    "Subject",
    "Present",
    "Total",
    "Percentage"
)

tree = ttk.Treeview(
    root,
    columns=columns,
    show="headings",
    height=10
)

for col in columns:
    tree.heading(col, text=col)
    tree.column(col, width=150)

tree.pack(pady=20)

overall_label = tk.Label(
    root,
    text="",
    font=("Arial", 13, "bold")
)

overall_label.pack()

shortage_label = tk.Label(
    root,
    text="",
    font=("Arial", 12, "bold")
)

shortage_label.pack(pady=10)

root.mainloop()