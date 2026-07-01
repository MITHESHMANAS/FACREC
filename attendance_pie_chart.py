import matplotlib.pyplot as plt

from services.report_service import get_attendance_by_subject


data = get_attendance_by_subject()

if not data:
    print("No attendance records found.")
    exit()

subjects = [row[0] for row in data]
counts = [row[1] for row in data]

plt.figure(figsize=(7, 7))

plt.pie(
    counts,
    labels=subjects,
    autopct="%1.1f%%"
)

plt.title("Attendance Distribution By Subject")

plt.show()