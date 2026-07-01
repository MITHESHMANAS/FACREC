from database import get_connection


def get_attendance_by_subject():
    """Return attendance count grouped by subject."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            subject,
            COUNT(*)
        FROM attendance
        GROUP BY subject
    """)

    data = cursor.fetchall()

    conn.close()

    return data


def get_attendance_records():
    """Return all attendance records."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            student_name,
            subject,
            date,
            time,
            status
        FROM attendance
    """)

    records = cursor.fetchall()

    conn.close()

    return records