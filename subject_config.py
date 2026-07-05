import os
import json

BASE_DIR = os.path.abspath(
    os.path.dirname(__file__)
)

CONFIG_FILE = os.path.join(
    BASE_DIR,
    "config.json"
)

SUBJECTS = [
    "AI",
    "ML",
    "DBMS",
    "CN",
    "OS"
]

DEFAULT_SUBJECT = "AI"


def get_current_subject():
    """Return the currently selected subject."""

    # Create config.json automatically if it doesn't exist
    if not os.path.exists(CONFIG_FILE):

        with open(CONFIG_FILE, "w") as file:
            json.dump(
                {
                    "current_subject": DEFAULT_SUBJECT
                },
                file,
                indent=4
            )

        return DEFAULT_SUBJECT

    with open(CONFIG_FILE, "r") as file:
        config = json.load(file)

    return config.get(
        "current_subject",
        DEFAULT_SUBJECT
    )


def set_current_subject(subject):
    """Update the currently selected subject."""

    if subject not in SUBJECTS:
        raise ValueError("Invalid subject")

    with open(CONFIG_FILE, "w") as file:
        json.dump(
            {
                "current_subject": subject
            },
            file,
            indent=4
        )