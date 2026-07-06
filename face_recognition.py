import json
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


def recognize_once():

    trainset, names = load_face_dataset()

    if trainset is None:

        return {

            "success": False,

            "recognized": [],

            "total": 0,

            "message": "Dataset not found"

        }

    detector = load_face_detector()

    cap = start_camera()

    recognized = []

    frame_count = 0

    MAX_FRAMES = 150

    try:

        while frame_count < MAX_FRAMES:

            frame_count += 1

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

                    continue

                student = names[label]

                recognized.append({

                    "name": student,

                    "subject": get_current_subject(),

                    "confidence": round(confidence,2),

                    "status":"Present"

                })

                cap.release()

                cv2.destroyAllWindows()

                return {

                    "success":True,

                    "recognized":recognized,

                    "total":1

                }

            cv2.imshow(

                "FACREC Enterprise",

                frame

            )

            if cv2.waitKey(1)&0xFF==ord("q"):

                break

    finally:

        cap.release()

        cv2.destroyAllWindows()

    return {

        "success":True,

        "recognized":[],

        "total":0

    }


if __name__=="__main__":

    print(

        json.dumps(

            recognize_once()

        )

    )