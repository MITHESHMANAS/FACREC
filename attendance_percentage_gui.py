import tkinter as tk
from tkinter import ttk, messagebox

from services.attendance_service import get_attendance_percentage_report


def search_student():

    student = entry.get().strip()

    if not student:
        messagebox.showwarning(
            "Missing Information",
            "Please enter a student name."
        )
        return

    try:
        report = get_attendance_percentage_report(student)

    except Exception as e:
        messagebox.showerror(
            "Error",
            f"Unable to fetch attendance report.\n\n{e}"
        )
        return

    rows = report["subjects"]

    # Clear previous results
    for item in tree.get_children():
        tree.delete(item)

    if not rows:

        overall_label.config(text="")
        shortage_label.config(text="")

        messagebox.showinfo(
            "Not Found",
            "No attendance records found."
        )

        return

    for row in rows:

        tree.insert(
            "",
            tk.END,
            values=(
                row["subject"],
                row["present"],
                row["total"],
                f"{row['percentage']}%"
            )
        )

    overall_label.config(
        text=f"Overall Attendance : {report['overall']}%"
    )

    if report["shortage"]:

        shortage_label.config(
            text="⚠ Shortage : " + ", ".join(report["shortage"]),
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
root.resizable(False, False)

tk.Label(
    root,
    text="Attendance Percentage Report",
    font=("Arial", 18, "bold")
).pack(pady=15)

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

entry.bind("<Return>", lambda event: search_student())

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