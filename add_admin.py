import sqlite3

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
INSERT OR IGNORE INTO users
(username, password, role)
VALUES
('admin', 'admin123', 'Admin')
""")

conn.commit()

cursor.execute("SELECT * FROM users")

for row in cursor.fetchall():
    print(row)

conn.close()