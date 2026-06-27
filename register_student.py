from database import get_connection

conn = get_connection()
cursor = conn.cursor()

name = input("Enter Name : ")
roll_no = input("Enter Roll Number : ")
branch = input("Enter Branch : ")
semester = int(input("Enter Semester : "))
email = input("Enter Email : ")

cursor.execute("""
INSERT INTO students
(name, roll_no, branch, semester, email)
VALUES (?, ?, ?, ?, ?)
""",
(name, roll_no, branch, semester, email))

conn.commit()
conn.close()

print("Student Registered Successfully")