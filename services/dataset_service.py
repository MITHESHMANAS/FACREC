import os
import numpy as np

DATASET_PATH = "face_dataset"


def ensure_dataset_directory():
    """Create dataset directory if it doesn't exist."""
    os.makedirs(DATASET_PATH, exist_ok=True)


def save_face_dataset(name, face_samples):
    """Save captured face samples as a .npy file."""

    ensure_dataset_directory()

    face_samples = np.array(face_samples)

    if len(face_samples) == 0:
        return False

    face_samples = face_samples.reshape((face_samples.shape[0], -1))

    np.save(
        os.path.join(DATASET_PATH, f"{name}.npy"),
        face_samples
    )

    return True


def load_face_dataset():
    """Load every face dataset and build a training set."""

    ensure_dataset_directory()

    face_data = []
    labels = []
    names = {}

    class_id = 0

    for file in os.listdir(DATASET_PATH):

        if not file.endswith(".npy"):
            continue

        data = np.load(
            os.path.join(DATASET_PATH, file)
        )

        names[class_id] = file[:-4]

        face_data.append(data)

        labels.append(
            np.full(
                (data.shape[0],),
                class_id
            )
        )

        class_id += 1

    if len(face_data) == 0:
        return None, None

    face_dataset = np.concatenate(face_data)

    face_labels = np.concatenate(labels).reshape((-1, 1))

    trainset = np.concatenate(
        (face_dataset, face_labels),
        axis=1
    )

    return trainset, names