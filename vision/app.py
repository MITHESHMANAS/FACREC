import os
import sys
import json

ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

sys.path.insert(0, ROOT)

from face_recognition import main

if __name__ == "__main__":

    result = main()

    print(json.dumps(result))