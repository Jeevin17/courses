/**
 * Exports the current application state to a JSON file.
 * @param {Object} data - The data to export (progress, notes, theme, etc.)
 */
export const exportData = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Validates the imported data structure.
 * @param {Object} data - The data to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateData = (data) => {
    if (!data || typeof data !== 'object') return false;
    // Basic check for required keys
    if (!data.progress && !data.notes) return false;
    return true;
};

/**
 * Reads and parses a JSON file.
 * @param {File} file - The file to import
 * @returns {Promise<Object>} - The parsed data
 */
export const importData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (validateData(data)) {
                    resolve(data);
                } else {
                    reject(new Error('Invalid data format'));
                }
            } catch (error) {
                reject(new Error('Failed to parse JSON'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};
