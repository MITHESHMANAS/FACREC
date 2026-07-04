from database import get_connection
from datetime import datetime


def get_total_students():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM students")

    total = cursor.fetchone()[0]

    conn.close()

    return total


def get_today_attendance():

    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.now().strftime("%d-%m-%Y")

    cursor.execute("""
        SELECT COUNT(*)
        FROM attendance
        WHERE date=?
    """, (today,))

    total = cursor.fetchone()[0]

    conn.close()

    return total


def get_total_attendance():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM attendance
    """)

    total = cursor.fetchone()[0]

    conn.close()

    return total


def get_dashboard_stats():

    return {
        "students": get_total_students(),
        "today": get_today_attendance(),
        "records": get_total_attendance()
    }