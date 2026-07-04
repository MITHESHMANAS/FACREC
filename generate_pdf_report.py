from services.pdf_report_service import generate_pdf_report
from subject_config import SUBJECTS

subject = input("Enter Subject : ").strip().upper()

if subject not in SUBJECTS:
    print("\nInvalid Subject!")
    print(f"Available Subjects: {', '.join(SUBJECTS)}")
    exit()

pdf = generate_pdf_report(subject)

print("\nPDF Generated Successfully!")
print(pdf)