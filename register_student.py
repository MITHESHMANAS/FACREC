import cv2

from services.dataset_service import (
    save_face_dataset,
    dataset_exists
)

OFFSET = 10
MAX_SAMPLES = 30
FACE_SIZE = (100, 100)

face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_alt.xml")

if face_cascade.empty():
    print("Error: Haar Cascade file not found.")
    raise SystemExit

print("\n========================================")
print("      FACREC - Face Registration")
print("========================================\n")
print("Create the student first in the FACREC web app,")
print("then enter their exact Roll No below to capture their face.\n")

roll_no = input("Roll No (must match the student in FACREC): ").strip()

if not roll_no:
    print("Roll No is required.")
    raise SystemExit

if dataset_exists(roll_no):
    print("\nFace dataset already exists for this roll number.")
    print("Delete the existing entry first if you want to re-capture.")
    raise SystemExit

print("\nOpening camera for face capture...\n")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Unable to access webcam.")
    raise SystemExit

face_samples = []
skip = 0

while True:

    ret, frame = cap.read()

    if not ret:
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )

    cv2.putText(
        frame,
        f"Captured : {len(face_samples)}/{MAX_SAMPLES}",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    if len(faces) == 1:

        x, y, w, h = faces[0]

        x1 = max(0, x - OFFSET)
        y1 = max(0, y - OFFSET)
        x2 = min(frame.shape[1], x + w + OFFSET)
        y2 = min(frame.shape[0], y + h + OFFSET)

        face = frame[y1:y2, x1:x2]

        try:
            face = cv2.resize(face, FACE_SIZE)
        except cv2.error:
            continue

        skip += 1

        if skip % 10 == 0:
            face_samples.append(face)
            print(f"Captured {len(face_samples)}/{MAX_SAMPLES}")

        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    elif len(faces) > 1:

        cv2.putText(
            frame,
            "Multiple Faces Detected!",
            (20, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

    else:

        cv2.putText(
            frame,
            "No Face Detected",
            (20, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

    cv2.imshow("FACREC Face Registration", frame)

    if len(face_samples) >= MAX_SAMPLES:
        break

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

saved = save_face_dataset(roll_no, face_samples)

if not saved:
    print("\nFace registration failed. No samples captured.")
    raise SystemExit

print("\n========================================")
print("Face Dataset Saved Successfully")
print("========================================")
print(f"Roll No    : {roll_no}")
print("\nNext step: in the FACREC web app, open this student's profile")
print(f"and set Face Dataset ID to '{roll_no}' so recognition can match them.")
