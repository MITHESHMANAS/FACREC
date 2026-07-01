import matplotlib.pyplot as plt

from services.report_service import get_attendance_by_subject


data = get_attendance_by_subject()

if not data:
    print("No attendance records found.")
    exit()

subjects = [row[0] for row in data]
counts = [row[1] for row in data]

plt.figure(figsize=(8, 5))

plt.bar(subjects, counts)

plt.title("Attendance By Subject")
plt.xlabel("Subject")
plt.ylabel("Attendance Count")

plt.show()