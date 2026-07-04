import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(attendance)")
columns = [column[1] for column in cursor.fetchall()]

if "student_id" not in columns:

    cursor.execute("""
        ALTER TABLE attendance
        ADD COLUMN student_id INTEGER
    """)

    print("student_id column added successfully.")

else:
    print("student_id already exists.")

conn.commit()
conn.close()