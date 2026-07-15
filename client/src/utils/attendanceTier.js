export const getTier = (percentage) => {

    if (percentage >= 90) {

        return {
            title: "Excellent",
            advice: "Keep maintaining this consistency.",
            badge: "bg-emerald-100 text-emerald-700",
            bar: "bg-emerald-500",
            text: "text-emerald-600"
        };

    }

    if (percentage >= 75) {

        return {
            title: "Good",
            advice: "Aim for 90%+ for excellent standing.",
            badge: "bg-amber-100 text-amber-700",
            bar: "bg-amber-500",
            text: "text-amber-600"
        };

    }

    return {
        title: "Needs Improvement",
        advice: "Attend upcoming classes regularly to avoid shortage.",
        badge: "bg-red-100 text-red-700",
        bar: "bg-red-500",
        text: "text-red-600"
    };

};

// react-circular-progressbar needs actual hex values, not Tailwind
// class names, since it styles an inline SVG rather than DOM classes.
export const getTierHex = (percentage) => {

    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";

};
