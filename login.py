import os
import tkinter as tk
from tkinter import messagebox

from services.auth_service import authenticate


def login():

    user = username.get().strip()
    pwd = password.get()

    if not user or not pwd:
        messagebox.showwarning(
            "Missing Information",
            "Please enter both username and password."
        )
        return

    try:
        role = authenticate(user, pwd)

    except Exception as e:
        messagebox.showerror(
            "Login Error",
            f"Unable to login.\n\n{e}"
        )
        return

    if role:

        messagebox.showinfo(
            "Login Successful",
            f"Welcome, {role}!"
        )

        root.destroy()

        os.system("python dashboard.py")

    else:

        messagebox.showerror(
            "Invalid Credentials",
            "Incorrect username or password."
        )


root = tk.Tk()

root.title("FACREC Login")
root.geometry("350x250")
root.resizable(False, False)

tk.Label(
    root,
    text="Username"
).pack(pady=(20, 5))

username = tk.Entry(root, width=30)
username.pack()

tk.Label(
    root,
    text="Password"
).pack(pady=(10, 5))

password = tk.Entry(
    root,
    show="*",
    width=30
)
password.pack()


password.bind("<Return>", lambda event: login())


tk.Button(
    root,
    text="Login",
    width=15,
    command=login
).pack(pady=20)

root.mainloop() 