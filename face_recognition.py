import json
import time
import base64

import cv2

from services.dataset_service import load_face_dataset
from services.recognition_service import predict
from services.face_service import (
    load_face_detector,
    start_camera,
    detect_faces,
    extract_face,
)

# Frames are downscaled before being embedded as a base64 snapshot so
# the JSON payload printed to stdout (and stored in MongoDB) stays a
# reasonable size. This is plenty for a thumbnail with a bounding box
# overlay - it isn't meant to be a forensic-quality image.
SNAPSHOT_MAX_WIDTH = 480
SNAPSHOT_JPEG_QUALITY = 70


def _encode_snapshot(frame):
    """
    Downscales the frame and returns (data_uri, frame_width, frame_height)
    for the *encoded* image, so the bounding box coordinates returned
    alongside it line up with what the frontend actually displays.
    """

    height, width = frame.shape[:2]

    if width > SNAPSHOT_MAX_WIDTH:
        scale = SNAPSHOT_MAX_WIDTH / width
        frame = cv2.resize(frame, (int(width * scale), int(height * scale)))

    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), SNAPSHOT_JPEG_QUALITY]

    success, buffer = cv2.imencode(".jpg", frame, encode_params)

    if not success:
        return None, 0, 0

    encoded_height, encoded_width = frame.shape[:2]

    data_uri = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

    return data_uri, encoded_width, encoded_height


def recognize_once():
    """
    Runs one recognition pass against the webcam.

    NOTE: This module does NOT talk to any database. It only knows
    about face_dataset/<roll_no>.npy files. It returns the roll_no
    it matched (which is the .npy filename) so the Node/Express layer
    can look the student up in MongoDB (Student.faceDatasetId or
    Student.rollNo) and handle attendance itself. Keeping the lookup
    on the Node side means there's a single source of truth (Mongo)
    instead of Python and Node disagreeing about student data.
    """

    start_time = time.time()

    trainset, names = load_face_dataset()

    if trainset is None:

        return {
            "success": False,
            "recognized": [],
            "total": 0,
            "message": "Face dataset not found. Register at least one student first."
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

            faces = detect_faces(detector, frame)

            for face in faces:

                try:
                    face_img = extract_face(frame, face)
                except cv2.error:
                    continue

                label, avg_distance, confidence, unknown = predict(
                    trainset,
                    face_img
                )

                if unknown:
                    continue

                # The dataset filename IS the roll number
                # (see services/dataset_service.py -> save_face_dataset)
                roll_no = names[label]

                duration_ms = round((time.time() - start_time) * 1000, 1)

                snapshot, frame_w, frame_h = _encode_snapshot(frame)

                # face is (x, y, w, h) in ORIGINAL frame coordinates -
                # scale it to match the (possibly downscaled) snapshot
                # so the frontend's overlay rectangle lines up.
                orig_h, orig_w = frame.shape[:2]
                scale_x = (frame_w / orig_w) if orig_w else 1
                scale_y = (frame_h / orig_h) if orig_h else 1

                x, y, w, h = face

                recognized.append({
                    "roll_no": roll_no,
                    "confidence": round(confidence, 2),
                    "status": "Present",
                    "duration_ms": duration_ms,
                    "snapshot": snapshot,
                    "bounding_box": {
                        "x": round(x * scale_x),
                        "y": round(y * scale_y),
                        "width": round(w * scale_x),
                        "height": round(h * scale_y),
                        "frame_width": frame_w,
                        "frame_height": frame_h
                    }
                })

                cap.release()
                cv2.destroyAllWindows()

                return {
                    "success": True,
                    "recognized": recognized,
                    "total": len(recognized)
                }

            cv2.imshow("FACREC - Recognition", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()

    return {
        "success": True,
        "recognized": [],
        "total": 0
    }


if __name__ == "__main__":

    print(
        json.dumps(
            recognize_once(),
            indent=4
        )
    )
