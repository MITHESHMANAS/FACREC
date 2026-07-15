/**
 * Two-letter avatar initials (e.g. "System Admin" -> "SA",
 * "Dr. Ananya Rao" -> "AR"), matching the reference design's avatar
 * style instead of the single-letter initial used before. Strips
 * common titles first so "Dr." doesn't end up as one of the letters.
 */
const TITLES = new Set(["dr", "dr.", "mr", "mr.", "mrs", "mrs.", "ms", "ms."]);

const getInitials = (name) => {

    if (!name) return "U";

    const words = name
        .trim()
        .split(/\s+/)
        .filter(w => !TITLES.has(w.toLowerCase()));

    if (words.length === 0) return "U";

    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();

};

export default getInitials;
