from services.student_service import add_student

name = input("Enter Name : ")
roll_no = input("Enter Roll Number : ")
branch = input("Enter Branch : ")
semester = int(input("Enter Semester : "))
email = input("Enter Email : ")

success, message = add_student(name, roll_no, branch, semester, email)
print(message)