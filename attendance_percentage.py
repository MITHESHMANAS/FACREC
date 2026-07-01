from services.attendance_service import get_attendance_summary


def calculate_attendance(student_name):
    return get_attendance_summary(student_name)


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