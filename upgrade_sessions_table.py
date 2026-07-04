import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    faculty TEXT DEFAULT 'Admin',
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    status TEXT DEFAULT 'ACTIVE'
)
""")

conn.commit()
conn.close()

print("Sessions table created successfully.")