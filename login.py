import tkinter as tk
from tkinter import messagebox
import os

from services.auth_service import authenticate


def login():

    role = authenticate(
        username.get(),
        password.get()
    )

    if role:

        messagebox.showinfo(
            "Success",
            f"Logged in as {role}"
        )

        root.destroy()

        os.system("python dashboard.py")

    else:

        messagebox.showerror(
            "Error",
            "Invalid Credentials"
        )


root = tk.Tk()

root.title("FACREC Login")
root.geometry("350x250")

tk.Label(
    root,
    text="Username"
).pack()

username = tk.Entry(root)
username.pack()

tk.Label(
    root,
    text="Password"
).pack()

password = tk.Entry(
    root,
    show="*"
)
password.pack()

tk.Button(
    root,
    text="Login",
    command=login
).pack(pady=20)

root.mainloop()