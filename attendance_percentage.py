import sqlite3


DB_NAME = "attendance.db"


def calculate_attendance(student_name):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            subject,
            COUNT(*) AS total_classes,
            SUM(CASE
                    WHEN status='Present'
                    THEN 1
                    ELSE 0
                END) AS attended_classes
        FROM attendance
        WHERE student_name = ?
        GROUP BY subject
    """, (student_name,))

    rows = cursor.fetchall()

    conn.close()

    attendance_summary = []

    for subject, total, attended in rows:

        if attended is None:
            attended = 0

        percentage = round((attended / total) * 100, 2)

        attendance_summary.append({
            "subject": subject,
            "present": attended,
            "total": total,
            "percentage": percentage
        })

    return attendance_summary


if __name__ == "__main__":

    student = input("Enter Student Name: ")

    result = calculate_attendance(student)

    print("\nAttendance Summary\n")

    for row in result:

        print("--------------------------------")
        print(f"Subject    : {row['subject']}")
        print(f"Present    : {row['present']}")
        print(f"Total      : {row['total']}")
        print(f"Percentage : {row['percentage']}%")