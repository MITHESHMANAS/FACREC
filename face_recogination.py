import numpy as np
import cv2
import os
import csv
from datetime import datetime

########## ATTENDANCE FUNCTION ##########

def markAttendance(name):

    attendance_dir = "attendance"
    attendance_file = os.path.join(attendance_dir, "attendance.csv")

    # Create attendance folder if not exists
    if not os.path.exists(attendance_dir):
        os.makedirs(attendance_dir)

    # Create CSV file with header if not exists
    if not os.path.exists(attendance_file):
        with open(attendance_file, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Date", "Time"])

    now = datetime.now()
    current_date = now.strftime("%d-%m-%Y")
    current_time = now.strftime("%H:%M:%S")

    already_marked = False

    with open(attendance_file, "r", newline="") as f:
        reader = csv.reader(f)

        for row in reader:
            if len(row) >= 2:
                if row[0] == name and row[1] == current_date:
                    already_marked = True
                    break

    if not already_marked:
        with open(attendance_file, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([name, current_date, current_time])

        print(f"[INFO] Attendance marked for {name}")


########## KNN CODE ##########

def distance(v1, v2):
    return np.sqrt(((v1 - v2) ** 2).sum())


def knn(train, test, k=5):

    dist = []

    for i in range(train.shape[0]):

        ix = train[i, :-1]
        iy = train[i, -1]

        d = distance(test, ix)

        dist.append([d, iy])

    dk = sorted(dist, key=lambda x: x[0])[:k]

    labels = np.array(dk)[:, -1]

    output = np.unique(labels, return_counts=True)

    index = np.argmax(output[1])

    return output[0][index]


########################################

cap = cv2.VideoCapture(0)

face_cascade = cv2.CascadeClassifier(
    "haarcascade_frontalface_alt.xml"
)

dataset_path = "./face_dataset/"

face_data = []
labels = []
class_id = 0
names = {}

############ LOAD DATASET ############

for fx in os.listdir(dataset_path):

    if fx.endswith(".npy"):

        names[class_id] = fx[:-4]

        data_item = np.load(os.path.join(dataset_path, fx))

        face_data.append(data_item)

        target = class_id * np.ones((data_item.shape[0],))

        labels.append(target)

        class_id += 1

face_dataset = np.concatenate(face_data, axis=0)

face_labels = np.concatenate(labels, axis=0).reshape((-1, 1))

print("Face Labels Shape :", face_labels.shape)
print("Face Dataset Shape :", face_dataset.shape)

trainset = np.concatenate((face_dataset, face_labels), axis=1)

print("Trainset Shape :", trainset.shape)

#######################################

font = cv2.FONT_HERSHEY_SIMPLEX

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

    for face in faces:

        x, y, w, h = face

        offset = 5

        face_section = frame[
            y - offset:y + h + offset,
            x - offset:x + w + offset
        ]

        try:
            face_section = cv2.resize(face_section, (100, 100))
        except:
            continue

        out = knn(trainset, face_section.flatten())

        name = names[int(out)]

        # Mark attendance
        markAttendance(name)

        # Draw rectangle
        cv2.putText(
            frame,
            name,
            (x, y - 10),
            font,
            1,
            (255, 0, 0),
            2,
            cv2.LINE_AA
        )

        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (255, 255, 255),
            2
        )

    cv2.imshow("FACREC Attendance System", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()