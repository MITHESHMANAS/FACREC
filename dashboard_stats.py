import sqlite3
from datetime import datetime

def get_stats():

    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT COUNT(*) FROM students"
    )
    total_students = cursor.fetchone()[0]

    today = datetime.now().strftime("%d-%m-%Y")

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM attendance
        WHERE date=?
        """,
        (today,)
    )

    today_attendance = cursor.fetchone()[0]

    conn.close()

    return total_students, today_attendance