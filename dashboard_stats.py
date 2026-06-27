import sqlite3
from datetime import datetime


def get_stats():
    from database import get_connection
    conn = get_connection()
    cursor = conn.cursor()

    # Total Students
    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]

    # Today's Attendance
    today = datetime.now().strftime("%d-%m-%Y")

    cursor.execute("""
        SELECT COUNT(*)
        FROM attendance
        WHERE date=?
    """, (today,))

    today_attendance = cursor.fetchone()[0]

    # Overall Attendance %
    cursor.execute("""
        SELECT
            COUNT(*),
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)
        FROM attendance
    """)

    total_classes, total_present = cursor.fetchone()

    if total_classes == 0:
        overall_percentage = 0
    else:
        overall_percentage = round(
            (total_present / total_classes) * 100,
            2
        )

    # Students Below 75%
    cursor.execute("""
        SELECT
            student_name,
            subject,
            COUNT(*) AS total,
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present
        FROM attendance
        GROUP BY student_name, subject
    """)

    rows = cursor.fetchall()

    shortage_students = set()

    for student, subject, total, present in rows:

        if present is None:
            present = 0

        percentage = (present / total) * 100

        if percentage < 75:
            shortage_students.add(student)

    conn.close()

    return (
        total_students,
        today_attendance,
        overall_percentage,
        len(shortage_students)
    )