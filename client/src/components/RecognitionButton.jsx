import { useState } from "react";
import { startRecognition } from "../services/recognitionService";

export default function RecognitionButton() {

    const [loading, setLoading] = useState(false);

    const handleRecognition = async () => {

        try {

            setLoading(true);

            const result = await startRecognition();

            console.log(result);

            alert(
                `${result.total} student(s) recognized`
            );

        } catch (err) {

            console.error(err);

            alert("Recognition Failed");

        } finally {

            setLoading(false);

        }

    };

    return (

        <button
            onClick={handleRecognition}
            disabled={loading}
            className="btn btn-primary"
        >

            {
                loading
                    ? "Recognizing..."
                    : "Start Face Recognition"
            }

        </button>

    );

}