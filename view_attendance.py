from services.attendance_service import get_all_attendance_records


rows = get_all_attendance_records()

print("\n===== ATTENDANCE RECORDS =====\n")

for row in rows:
    print(row)