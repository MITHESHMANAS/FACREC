import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(attendance)")

for row in cursor.fetchall():
    print(row)

conn.close()