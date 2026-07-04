from services.session_service import *

session = start_session("ML")

print("Started Session ID:", session)

print(get_current_session())