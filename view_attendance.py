import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
SELECT *
FROM attendance
""")

rows = cursor.fetchall()

print("\n===== ATTENDANCE RECORDS =====\n")

for row in rows:
    print(row)

conn.close()