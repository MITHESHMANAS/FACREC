import cv2


CASCADE_PATH = "haarcascade_frontalface_alt.xml"


def load_face_detector():
    detector = cv2.CascadeClassifier(CASCADE_PATH)

    if detector.empty():
        raise FileNotFoundError(
            "haarcascade_frontalface_alt.xml not found"
        )

    return detector


def start_camera(camera_index=0):

    cap = cv2.VideoCapture(camera_index)

    if not cap.isOpened():
        raise RuntimeError("Unable to open webcam")

    return cap


def detect_faces(detector, frame):

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    return detector.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )


def extract_face(frame, face, offset=5):

    x, y, w, h = face

    x1 = max(0, x - offset)
    y1 = max(0, y - offset)

    x2 = min(frame.shape[1], x + w + offset)
    y2 = min(frame.shape[0], y + h + offset)

    section = frame[y1:y2, x1:x2]

    return cv2.resize(
        section,
        (100, 100)
    )


def draw_prediction(
    frame,
    face,
    name,
    confidence,
    distance
):

    x, y, w, h = face

    font = cv2.FONT_HERSHEY_SIMPLEX

    cv2.rectangle(
        frame,
        (x, y),
        (x + w, y + h),
        (255, 255, 255),
        2
    )

    cv2.putText(
        frame,
        f"{name} ({confidence:.1f}%)",
        (x, y - 10),
        font,
        0.8,
        (255, 0, 0),
        2
    )

    cv2.putText(
        frame,
        f"D:{int(distance)}",
        (x, y + h + 20),
        font,
        0.6,
        (0, 255, 0),
        2
    )