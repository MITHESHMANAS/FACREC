import sqlite3
import matplotlib.pyplot as plt

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
SELECT subject,
COUNT(*)
FROM attendance
GROUP BY subject
""")

data = cursor.fetchall()

if len(data) == 0:
    print("No attendance records found")
    exit()

subjects = [row[0] for row in data]
counts = [row[1] for row in data]

plt.figure(figsize=(8,5))

plt.bar(
    subjects,
    counts
)

plt.title("Attendance By Subject")
plt.xlabel("Subject")
plt.ylabel("Attendance Count")

plt.show()

conn.close()