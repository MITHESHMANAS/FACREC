import json

CONFIG_FILE = "config.json"

SUBJECTS = [
    "AI",
    "ML",
    "DBMS",
    "CN",
    "OS"
]


def get_current_subject():
    """Return the currently selected subject."""

    with open(CONFIG_FILE, "r") as file:
        config = json.load(file)

    return config["current_subject"]


def set_current_subject(subject):
    """Update the currently selected subject."""

    with open(CONFIG_FILE, "w") as file:
        json.dump(
            {
                "current_subject": subject
            },
            file,
            indent=4
        )