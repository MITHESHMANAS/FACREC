import cv2
import numpy as np
import os

# Load Haar Cascade
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_alt.xml")

if face_cascade.empty():
    print("Error: Could not load haarcascade_frontalface_alt.xml")
    exit()

# Start Webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

skip = 0
face_data = []

dataset_path = "./face_dataset/"

# Create folder if it doesn't exist
if not os.path.exists(dataset_path):
    os.makedirs(dataset_path)

file_name = input("Enter the name of person: ")

while True:

    ret, frame = cap.read()

    if not ret:
        continue

    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray_frame,
        scaleFactor=1.3,
        minNeighbors=5
    )

    if len(faces) == 0:
        cv2.imshow("faces", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break

        continue

    # Sort faces by area (largest face first)
    faces = sorted(
        faces,
        key=lambda x: x[2] * x[3],
        reverse=True
    )

    skip += 1

    x, y, w, h = faces[0]

    offset = 10

    x1 = max(0, x - offset)
    y1 = max(0, y - offset)
    x2 = min(frame.shape[1], x + w + offset)
    y2 = min(frame.shape[0], y + h + offset)

    face_section = frame[y1:y2, x1:x2]

    try:
        face_section = cv2.resize(face_section, (100, 100))
    except:
        continue

    # Save every 10th frame
    if skip % 10 == 0:
        face_data.append(face_section)
        print(f"Samples Collected: {len(face_data)}")

    cv2.rectangle(
        frame,
        (x, y),
        (x + w, y + h),
        (0, 255, 0),
        2
    )

    cv2.imshow("Face", face_section)
    cv2.imshow("faces", frame)

    # Auto stop after 30 samples
    if len(face_data) >= 30:
        print("30 samples collected.")
        break

    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        print("Exiting...")
        break

# Convert to numpy array
face_data = np.array(face_data)

if len(face_data) > 0:

    face_data = face_data.reshape(
        (face_data.shape[0], -1)
    )

    save_path = os.path.join(dataset_path, file_name + ".npy")

    np.save(save_path, face_data)

    print("Dataset saved at:")
    print(save_path)

else:
    print("No face data collected.")

cap.release()
cv2.destroyAllWindows(x )