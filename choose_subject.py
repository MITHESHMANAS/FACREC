
from subject_config import SUBJECTS

print("\n===== SUBJECT LIST =====\n")

for i, subject in enumerate(SUBJECTS, start=1):
    print(f"{i}. {subject}")

choice = int(input("\nSelect Subject : "))

CURRENT_SUBJECT = SUBJECTS[choice - 1]

print("\nSelected Subject :", CURRENT_SUBJECT)