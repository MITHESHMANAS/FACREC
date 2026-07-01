import cv2

from services.dataset_service import save_face_dataset

face_cascade = cv2.CascadeClassifier(
    "haarcascade_frontalface_alt.xml"
)

if face_cascade.empty():
    print("Error: Haar Cascade file not found.")
    exit()

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

person_name = input("Enter Student Name: ")

face_samples = []

skip = 0
OFFSET = 10
MAX_SAMPLES = 30

while True:

    ret, frame = cap.read()

    if not ret:
        continue

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )

    if len(faces):

        faces = sorted(
            faces,
            key=lambda f: f[2] * f[3],
            reverse=True
        )

        x, y, w, h = faces[0]

        x1 = max(0, x - OFFSET)
        y1 = max(0, y - OFFSET)
        x2 = min(frame.shape[1], x + w + OFFSET)
        y2 = min(frame.shape[0], y + h + OFFSET)

        face = frame[y1:y2, x1:x2]

        try:

            face = cv2.resize(
                face,
                (100, 100)
            )

        except:

            continue

        skip += 1

        if skip % 10 == 0:

            face_samples.append(face)

            print(
                f"Collected {len(face_samples)} / {MAX_SAMPLES}"
            )

        cv2.imshow(
            "Face",
            face
        )

        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

    cv2.imshow(
        "Capture Dataset",
        frame
    )

    if len(face_samples) >= MAX_SAMPLES:
        break

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()

cv2.destroyAllWindows()

if save_face_dataset(
    person_name,
    face_samples
):

    print("Dataset saved successfully.")

else:

    print("No dataset saved.")