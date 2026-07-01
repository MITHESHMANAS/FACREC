from services.attendance_service import get_fixed_class_attendance


student_name = input("Enter Student Name : ")

report = get_fixed_class_attendance(student_name)

print("\nAttendance Report")
print("-" * 30)

for row in report:

    print(
        f"{row['subject']} : {row['percentage']:.2f}%"
    )