from subject_config import SUBJECTS

print("\nAvailable Subjects:\n")

for i, sub in enumerate(SUBJECTS, start=1):
    print(f"{i}. {sub}")

choice = int(input("\nSelect Subject : "))

print(f"\nSelected Subject : {SUBJECTS[choice-1]}")