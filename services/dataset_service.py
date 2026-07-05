import os
import numpy as np

# FACREC project root
BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

# Absolute path to face_dataset
DATASET_PATH = os.path.join(
    BASE_DIR,
    "face_dataset"
)


def ensure_dataset_directory():
    """Create dataset directory if it doesn't exist."""
    os.makedirs(DATASET_PATH, exist_ok=True)


def dataset_exists(name):
    """Check if a student's dataset exists."""
    return os.path.exists(
        os.path.join(DATASET_PATH, f"{name}.npy")
    )


def list_registered_students():
    """Return all registered students having face datasets."""
    ensure_dataset_directory()

    return sorted([
        file[:-4]
        for file in os.listdir(DATASET_PATH)
        if file.endswith(".npy")
    ])


def delete_face_dataset(name):
    """Delete a student's face dataset."""
    path = os.path.join(DATASET_PATH, f"{name}.npy")

    if os.path.exists(path):
        os.remove(path)
        return True

    return False


def save_face_dataset(name, face_samples):
    """Save captured face samples."""

    ensure_dataset_directory()

    face_samples = np.array(face_samples)

    if len(face_samples) == 0:
        return False

    face_samples = face_samples.reshape(
        (face_samples.shape[0], -1)
    )

    np.save(
        os.path.join(DATASET_PATH, f"{name}.npy"),
        face_samples
    )

    return True


def load_face_dataset():
    """Load all datasets."""

    ensure_dataset_directory()

    # Temporary debug (remove after testing)


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