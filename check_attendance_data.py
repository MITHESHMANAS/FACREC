# check_attendance_data.py

import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
SELECT
    attendance_id,
    student_id,
    student_name,
    subject
FROM attendance
ORDER BY attendance_id DESC
LIMIT 5
""")

for row in cursor.fetchall():
    print(row)

conn.close()