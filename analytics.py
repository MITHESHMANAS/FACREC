from services.student_service import get_student_count
from services.attendance_service import get_total_attendance_records


total_students = get_student_count()
total_attendance = get_total_attendance_records()

print("\n===== FACREC ANALYTICS =====\n")

print("Total Students :", total_students)
print("Attendance Records :", total_attendance)