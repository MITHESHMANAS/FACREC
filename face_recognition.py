import numpy as np
import cv2
import os
import sqlite3
from datetime import datetime

# =====================================
# CONFIGURATION
# =====================================

CURRENT_SUBJECT = "AI"

# Tune after testing
UNKNOWN_THRESHOLD = 10000

# =====================================
# ATTENDANCE FUNCTION
# =====================================

def markAttendance(name, subject):

    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    now = datetime.now()

    date = now.strftime("%d-%m-%Y")
    time = now.strftime("%H:%M:%S")

    cursor.execute(
        """
        SELECT *
        FROM attendance
        WHERE student_name=?
        AND subject=?
        AND date=?
        """,
        (name, subject, date)
    )

    result = cursor.fetchone()

    if result is None:

        cursor.execute(
            """
            INSERT INTO attendance
            (
                student_name,
                subject,
                date,
                time,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                name,
                subject,
                date,
                time,
                "Present"
            )
        )

        conn.commit()

        print(
            f"[INFO] {name} marked present in {subject}"
        )

    conn.close()


# =====================================
# KNN FUNCTIONS
# =====================================

def distance(v1, v2):

    return np.sqrt(
        ((v1 - v2) ** 2).sum()
    )


def knn(train, test, k=5):

    dist = []

    for i in range(train.shape[0]):

        ix = train[i, :-1]
        iy = train[i, -1]

        d = distance(test, ix)

        dist.append([d, iy])

    dk = sorted(
        dist,
        key=lambda x: x[0]
    )[:k]

    labels = np.array(dk)[:, -1]

    output = np.unique(
        labels,
        return_counts=True
    )

    index = np.argmax(output[1])

    predicted_label = output[0][index]

    # Average distance of top-k neighbors
    average_distance = np.mean(
        [item[0] for item in dk]
    )

    return predicted_label, average_distance


# =====================================
# CAMERA & FACE CASCADE
# =====================================

cap = cv2.VideoCapture(0)

face_cascade = cv2.CascadeClassifier(
    "haarcascade_frontalface_alt.xml"
)

if face_cascade.empty():

    print(
        "ERROR: Haar Cascade File Not Found"
    )

    exit()

# =====================================
# LOAD DATASET
# =====================================

dataset_path = "./face_dataset/"

face_data = []
labels = []

class_id = 0

names = {}

for fx in os.listdir(dataset_path):

    if fx.endswith(".npy"):

        names[class_id] = fx[:-4]

        data_item = np.load(
            os.path.join(
                dataset_path,
                fx
            )
        )

        face_data.append(data_item)

        target = class_id * np.ones(
            (data_item.shape[0],)
        )

        labels.append(target)

        class_id += 1

face_dataset = np.concatenate(
    face_data,
    axis=0
)

face_labels = np.concatenate(
    labels,
    axis=0
).reshape((-1, 1))

print(
    "Face Dataset Shape :",
    face_dataset.shape
)

print(
    "Face Labels Shape :",
    face_labels.shape
)

trainset = np.concatenate(
    (
        face_dataset,
        face_labels
    ),
    axis=1
)

print(
    "Trainset Shape :",
    trainset.shape
)

# =====================================
# START RECOGNITION
# =====================================

font = cv2.FONT_HERSHEY_SIMPLEX

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

    for face in faces:

        x, y, w, h = face

        offset = 5

        face_section = frame[
            y-offset:y+h+offset,
            x-offset:x+w+offset
        ]

        try:

            face_section = cv2.resize(
                face_section,
                (100, 100)
            )

        except:

            continue

        # ==========================
        # PREDICTION
        # ==========================

        out, distance_score = knn(
            trainset,
            face_section.flatten()
        )

        confidence = max(
            0,
            100 * (
                1 -
                distance_score /
                (UNKNOWN_THRESHOLD * 1.5)
            )
        )

        if distance_score > UNKNOWN_THRESHOLD:

            name = "UNKNOWN"

        else:

            name = names[int(out)]

            markAttendance(
                name,
                CURRENT_SUBJECT
            )

        # ==========================
        # DRAW NAME + CONFIDENCE
        # ==========================

        cv2.putText(
            frame,
            f"{name} ({confidence:.1f}%)",
            (x, y - 10),
            font,
            0.8,
            (255, 0, 0),
            2,
            cv2.LINE_AA
        )

        # Debug Distance
        cv2.putText(
            frame,
            f"D:{int(distance_score)}",
            (x, y + h + 20),
            font,
            0.6,
            (0, 255, 0),
            2
        )

        # Face Rectangle
        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (255, 255, 255),
            2
        )

    cv2.imshow(
        "FACREC Attendance System",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()