import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

student_name = input("Enter Student Name : ")

subjects = ["AI", "ML", "DBMS", "CN", "OS"]

print("\nAttendance Report")
print("-" * 30)

for subject in subjects:

    cursor.execute("""
    SELECT COUNT(*)
    FROM attendance
    WHERE student_name=?
    AND subject=?
    """,
    (student_name, subject))

    attended = cursor.fetchone()[0]

    TOTAL_CLASSES = 30

    percentage = (attended / TOTAL_CLASSES) * 100

    print(
        f"{subject} : {percentage:.2f}%"
    )

conn.close()