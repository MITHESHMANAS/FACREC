import tkinter as tk
from tkinter import ttk

from services.attendance_service import get_low_attendance_students


rows = get_low_attendance_students()

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

for row in rows:
    tree.insert(
        "",
        tk.END,
        values=(
            row["student"],
            row["subject"],
            row["present"],
            row["total"],
            f"{row['percentage']}%",
        )
    )

root.mainloop()