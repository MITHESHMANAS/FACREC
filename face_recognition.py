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
        return {
            "success": False,
            "message": "No face dataset found."
        }

    detector = load_face_detector()
    cap = start_camera()

    recognized_students = []

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

                    # Current subject
                    subject = get_current_subject()

                    # Mark attendance
                    ##mark_attendance(
                        ##student,
                      ##  subject
                    ##)

                    # Avoid duplicate entries in same session
                    already_exists = False

                    for s in recognized_students:
                        if s["name"] == student:
                            already_exists = True
                            break

                    if not already_exists:

                        recognized_students.append({
                            "name": student,
                            "subject": subject,
                            "confidence": round(confidence, 2),
                            "status": "Present"
                        })

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

    return {
        "success": True,
        "recognized": recognized_students,
        "total": len(recognized_students)
    }


if __name__ == "__main__":

    import json

    result = main()

    print(json.dumps(result))