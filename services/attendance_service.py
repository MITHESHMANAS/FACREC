from database import get_connection


def get_student_attendance(student_name):
    """Return attendance grouped by subject."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            subject,
            COUNT(*) AS total_classes,
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present_classes
        FROM attendance
        WHERE student_name = ?
        GROUP BY subject
    """, (student_name,))

    attendance = cursor.fetchall()
    conn.close()

    return attendance
def get_overall_attendance(student_name):
    """Return overall attendance percentage."""
    attendance = get_student_attendance(student_name)

    total_classes = 0
    total_present = 0

    for _, total, present in attendance:
        total_classes += total
        total_present += present or 0

    if total_classes == 0:
        return 0.0

    return round((total_present / total_classes) * 100, 2)
def get_attendance_summary(student_name):
    """Return attendance summary for each subject."""
    attendance = get_student_attendance(student_name)

    attendance_summary = []

    for subject, total, present in attendance:

        present = present or 0

        percentage = round((present / total) * 100, 2)

        attendance_summary.append({
            "subject": subject,
            "present": present,
            "total": total,
            "percentage": percentage,
        })

    return attendance_summary

def get_low_attendance_students(threshold=75):
    """Return students whose attendance is below the given threshold."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            student_name,
            subject,
            COUNT(*) AS total_classes,
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present_classes
        FROM attendance
        GROUP BY student_name, subject
    """)

    rows = cursor.fetchall()
    conn.close()

    result = []

    for student, subject, total, present in rows:

        present = present or 0

        percentage = round((present / total) * 100, 2)

        if percentage < threshold:
            result.append({
                "student": student,
                "subject": subject,
                "present": present,
                "total": total,
                "percentage": percentage,
            })

    return result
from datetime import datetime


def get_today_attendance_count():
    """Return today's attendance record count."""

    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.now().strftime("%d-%m-%Y")

    cursor.execute("""
        SELECT COUNT(*)
        FROM attendance
        WHERE date=?
    """, (today,))

    count = cursor.fetchone()[0]

    conn.close()

    return count


def get_overall_attendance_percentage():
    """Return overall attendance percentage."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*),
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)
        FROM attendance
    """)

    total_classes, total_present = cursor.fetchone()

    conn.close()

    if total_classes == 0:
        return 0.0

    total_present = total_present or 0

    return round((total_present / total_classes) * 100, 2)

def get_total_attendance_records():
    """Return total attendance records."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM attendance")

    count = cursor.fetchone()[0]

    conn.close()

    return count