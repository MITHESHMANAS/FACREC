import numpy as np

UNKNOWN_THRESHOLD = 10000


def distance(v1, v2):
    """Calculate Euclidean distance."""
    return np.sqrt(((v1 - v2) ** 2).sum())


def knn(trainset, test, k=5):
    """Predict label using KNN."""

    distances = []

    for row in trainset:

        features = row[:-1]
        label = row[-1]

        d = distance(test, features)

        distances.append((d, label))

    distances = sorted(
        distances,
        key=lambda x: x[0]
    )[:k]

    labels = np.array(
        [item[1] for item in distances]
    )

    values, counts = np.unique(
        labels,
        return_counts=True
    )

    prediction = values[np.argmax(counts)]

    avg_distance = np.mean(
        [item[0] for item in distances]
    )

    return prediction, avg_distance


def predict(trainset, face):
    """
    Predict student label.

    Returns:
        label,
        average_distance,
        confidence,
        is_unknown
    """

    label, dist = knn(
        trainset,
        face.flatten()
    )

    confidence = max(
        0,
        100 * (
            1 -
            dist /
            (UNKNOWN_THRESHOLD * 1.5)
        )
    )

    unknown = dist > UNKNOWN_THRESHOLD

    return (
        int(label),
        dist,
        confidence,
        unknown
    )