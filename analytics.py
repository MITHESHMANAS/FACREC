import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

# Total Students
cursor.execute(
    "SELECT COUNT(*) FROM students"
)
total_students = cursor.fetchone()[0]

# Total Attendance Records
cursor.execute(
    "SELECT COUNT(*) FROM attendance"
)
total_attendance = cursor.fetchone()[0]

print("\n===== FACREC ANALYTICS =====\n")

print("Total Students :", total_students)

print("Attendance Records :", total_attendance)

conn.close()