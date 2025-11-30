/**
 * Parses duration and effort strings to estimate total course minutes.
 * 
 * @param {string} durationStr - e.g., "9 weeks", "12 weeks"
 * @param {string} effortStr - e.g., "15 hours/week", "8-10 hours/week"
 * @returns {number} Total estimated minutes
 */
export const parseDuration = (durationStr, effortStr) => {
    if (!durationStr || !effortStr) return 0;

    try {
        // Parse weeks
        const weeksMatch = durationStr.match(/(\d+)/);
        const weeks = weeksMatch ? parseInt(weeksMatch[1], 10) : 0;

        // Parse hours per week
        // Handle ranges like "8-10 hours/week" by taking the average
        const hoursMatch = effortStr.match(/(\d+)(?:-(\d+))?/);
        let hoursPerWeek = 0;

        if (hoursMatch) {
            const min = parseInt(hoursMatch[1], 10);
            const max = hoursMatch[2] ? parseInt(hoursMatch[2], 10) : min;
            hoursPerWeek = (min + max) / 2;
        }

        const totalHours = weeks * hoursPerWeek;
        return totalHours * 60; // Convert to minutes
    } catch (e) {
        console.error("Error parsing duration:", e);
        return 0;
    }
};

/**
 * Formats minutes into a readable string (e.g., "12h 30m")
 * @param {number} minutes 
 * @returns {string}
 */
export const formatTime = (minutes) => {
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};
