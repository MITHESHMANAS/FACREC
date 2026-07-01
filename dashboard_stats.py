from services.student_service import get_student_count
from services.attendance_service import (
    get_today_attendance_count,
    get_overall_attendance_percentage,
    get_low_attendance_students,
)

from services.student_service import get_student_count
from services.attendance_service import (
    get_today_attendance_count,
    get_overall_attendance_percentage,
    get_low_attendance_students,
)


def get_stats():

    total_students = get_student_count()

    today_attendance = get_today_attendance_count()

    overall_percentage = get_overall_attendance_percentage()

    shortage_students = get_low_attendance_students()

    unique_students = {
        row["student"]
        for row in shortage_students
    }

    return (
        total_students,
        today_attendance,
        overall_percentage,
        len(unique_students)
    )