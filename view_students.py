from services.student_service import get_all_students

for student in get_all_students():

    print("-" * 40)
    print(f"Name      : {student['name']}")
    print(f"Roll No   : {student['roll_no']}")
    print(f"Branch    : {student['branch']}")
    print(f"Semester  : {student['semester']}")
    print(f"Email     : {student['email']}")