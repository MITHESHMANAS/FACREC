from subject_config import SUBJECTS, set_current_subject, get_current_subject

print("\n===== SUBJECT LIST =====\n")

for i, subject in enumerate(SUBJECTS, start=1):
    print(f"{i}. {subject}")

try:
    choice = int(input("\nSelect Subject : "))

    if choice < 1 or choice > len(SUBJECTS):
        print("\nInvalid Choice!")
        exit()

    selected_subject = SUBJECTS[choice - 1]

    set_current_subject(selected_subject)

    print(f"\nCurrent Subject changed to : {selected_subject}")

except ValueError:
    print("\nPlease enter a valid number.")