import sqlite3
import os

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

if not os.path.exists("reports"):
    os.makedirs("reports")

pdf_file = "reports/attendance_report.pdf"

doc = SimpleDocTemplate(pdf_file)

elements = []

styles = getSampleStyleSheet()

title = Paragraph(
    "FACREC Attendance Report",
    styles["Title"]
)

elements.append(title)
elements.append(Spacer(1, 20))

conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

cursor.execute("""
SELECT
student_name,
subject,
date,
time,
status
FROM attendance
""")

records = cursor.fetchall()

data = [
    [
        "Student",
        "Subject",
        "Date",
        "Time",
        "Status"
    ]
]

for row in records:
    data.append(list(row))

table = Table(data)

table.setStyle(
    TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.grey),
        ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
        ('GRID',(0,0),(-1,-1),1,colors.black),
        ('BACKGROUND',(0,1),(-1,-1),colors.beige)
    ])
)

elements.append(table)

doc.build(elements)

conn.close()

print("PDF Generated Successfully")
print("Saved:", pdf_file)