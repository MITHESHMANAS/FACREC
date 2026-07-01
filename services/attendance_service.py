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