from services.auth_service import get_all_users

print("\n===== USERS =====\n")

for user in get_all_users():
    print(user)