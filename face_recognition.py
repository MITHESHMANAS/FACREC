import cv2

from subject_config import get_current_subject

from services.dataset_service import load_face_dataset
from services.recognition_service import predict
from services.face_service import (
    load_face_detector,
    start_camera,
    detect_faces,
    extract_face,
    draw_prediction,
)
from services.attendance_service import mark_attendance


def main():

    trainset, names = load_face_dataset()

    if trainset is None:
        print("No face dataset found.")
        return

    detector = load_face_detector()
    cap = start_camera()

    try:

        while True:

            ret, frame = cap.read()

            if not ret:
                continue

            faces = detect_faces(
                detector,
                frame
            )

            for face in faces:

                try:

                    face_img = extract_face(
                        frame,
                        face
                    )

                except cv2.error:
                    continue

                label, distance, confidence, unknown = predict(
                    trainset,
                    face_img
                )

                if unknown:

                    student = "UNKNOWN"

                else:

                    student = names[label]

                    # Get currently selected subject
                    subject = get_current_subject()

                    # Mark attendance
                    mark_attendance(
                        student,
                        subject
                    )

                draw_prediction(
                    frame,
                    face,
                    student,
                    confidence,
                    distance
                )

            cv2.imshow(
                "FACREC Attendance System",
                frame
            )

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break

    finally:

        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":

    main()