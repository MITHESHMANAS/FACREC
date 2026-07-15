import { useState } from "react";
import Modal from "./Modal";

// Renders the captured frame with the Haar Cascade bounding box drawn
// on top of it (as a CSS-positioned overlay, using percentages so it
// stays aligned regardless of how large the image is rendered).
// Clicking the thumbnail opens a larger view via the shared Modal.
const BoundingBoxOverlay = ({ boundingBox }) => {

    if (!boundingBox || !boundingBox.frameWidth || !boundingBox.frameHeight) {
        return null;
    }

    const left = (boundingBox.x / boundingBox.frameWidth) * 100;
    const top = (boundingBox.y / boundingBox.frameHeight) * 100;
    const width = (boundingBox.width / boundingBox.frameWidth) * 100;
    const height = (boundingBox.height / boundingBox.frameHeight) * 100;

    return (

        <div
            className="absolute border-2 border-green-400 rounded-sm"
            style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.15)"
            }}
        />

    );

};

const RecognitionSnapshot = ({ snapshot, boundingBox, size = "sm" }) => {

    const [expanded, setExpanded] = useState(false);

    const dimensions = size === "sm" ? "w-16 h-16" : "w-full h-full";

    if (!snapshot) {

        return (

            <div className={`${dimensions} rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs`}>
                No image
            </div>

        );

    }

    return (

        <>

            <button
                type="button"
                onClick={() => setExpanded(true)}
                className={`relative ${dimensions} rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition`}
            >

                <img
                    src={snapshot}
                    alt="Recognition snapshot"
                    className="w-full h-full object-cover"
                />

                <BoundingBoxOverlay boundingBox={boundingBox} />

            </button>

            <Modal
                isOpen={expanded}
                title="Recognition Snapshot"
                onClose={() => setExpanded(false)}
            >

                <div className="relative w-full">

                    <img
                        src={snapshot}
                        alt="Recognition snapshot - full size"
                        className="w-full rounded-lg"
                    />

                    <BoundingBoxOverlay boundingBox={boundingBox} />

                </div>

            </Modal>

        </>

    );

};

export default RecognitionSnapshot;
