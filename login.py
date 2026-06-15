import tkinter as tk
from tkinter import messagebox
import sqlite3
import os

root = tk.Tk()
root.title("FACREC Login")
root.geometry("350x250")

tk.Label(root, text="Username").pack()
username = tk.Entry(root)
username.pack()

tk.Label(root, text="Password").pack()
password = tk.Entry(root, show="*")
password.pack()

def login():

    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role
        FROM users
        WHERE username=?
        AND password=?
        """,
        (
            username.get(),
            password.get()
        )
    )

    result = cursor.fetchone()

    conn.close()

    if result:

        messagebox.showinfo(
            "Success",
            f"Logged in as {result[0]}"
        )

        root.destroy()

        os.system("python dashboard.py")

    else:

        messagebox.showerror(
            "Error",
            "Invalid Credentials"
        )

tk.Button(
    root,
    text="Login",
    command=login
).pack(pady=20)

root.mainloop()