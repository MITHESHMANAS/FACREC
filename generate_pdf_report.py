import os

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from services.report_service import get_attendance_records


os.makedirs("reports", exist_ok=True)

pdf_file = "reports/attendance_report.pdf"

doc = SimpleDocTemplate(pdf_file)

elements = []

styles = getSampleStyleSheet()

elements.append(
    Paragraph(
        "FACREC Attendance Report",
        styles["Title"]
    )
)

elements.append(Spacer(1, 20))

records = get_attendance_records()

data = [[
    "Student",
    "Subject",
    "Date",
    "Time",
    "Status"
]]

for row in records:
    data.append(list(row))

table = Table(data)

table.setStyle(
    TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
    ])
)

elements.append(table)

doc.build(elements)

print("PDF Generated Successfully")
print("Saved:", pdf_file)