import { ossuData } from '../data/ossu-data.js';

// Define section-level dependencies
const SECTION_DEPENDENCIES = {
    'core-theory': ['core-math'],
    'advanced-systems': ['prerequisites'], // Requires Physics
    'advanced-programming': ['core-programming', 'core-math', 'core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'],
    'advanced-math': ['core-programming', 'core-math', 'core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'],
    'advanced-security': ['core-programming', 'core-math', 'core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'],
    'advanced-theory': ['core-programming', 'core-math', 'core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'],
    'final-project': ['core-programming', 'core-math', 'core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics']
};

/**
 * Finds the prerequisite course or section for a given course ID.
 * @param {string} courseId 
 * @returns {object|null} The prerequisite object { title, id (optional) } or null.
 */
export const getPrerequisite = (courseId) => {
    for (const section of ossuData) {
        // Check if this course belongs to a section with dependencies
        if (section.courses.some(c => c.id === courseId)) {
            // 1. Check Section-Level Dependencies first
            if (SECTION_DEPENDENCIES[section.id]) {
                // Special case for Final Project / Advanced to show "All Core"
                if (section.id === 'final-project' || section.id.startsWith('advanced-')) {
                    const index = section.courses.findIndex(c => c.id === courseId);
                    // Show the section prerequisite for the first course, or if we want to be explicit for all
                    if (index === 0 || section.id === 'final-project') {
                        if (section.id === 'final-project') return { title: "All Core CS Courses" };
                        if (section.id === 'advanced-systems') return { title: "Basic Physics" };
                        if (section.id === 'core-theory') return { title: "Core Math" };
                        if (section.id.startsWith('advanced-')) return { title: "All Core CS Courses" };
                    }
                }
            }

            // 2. Check Sequential Course Dependency
            // Final Projects are NOT sequential
            if (section.id === 'final-project') {
                return { title: "All Core CS Courses" };
            }

            const courseIndex = section.courses.findIndex(c => c.id === courseId);
            if (courseIndex > 0) {
                return section.courses[courseIndex - 1];
            }

            // 3. If first course in section, check if section depends on another section
            if (courseIndex === 0 && SECTION_DEPENDENCIES[section.id]) {
                if (section.id === 'core-theory') return { title: "Core Math" };
                if (section.id === 'advanced-systems') return { title: "Basic Physics" };
            }
        }
    }
    return null;
};

/**
 * Checks if the prerequisites for a course are met.
 * @param {string} courseId 
 * @param {object} progress The progress object from the store.
 * @returns {boolean} True if prerequisites are met (or none exist), false otherwise.
 */
export const checkPrerequisites = (courseId, progress) => {
    // Find the section this course belongs to
    // Find the section this course belongs to
    const section = ossuData.find(s => (s.courses || []).some(c => c.id === courseId));
    if (!section) return true;

    const courseIndex = section.courses.findIndex(c => c.id === courseId);

    // 1. Check Section Dependencies
    if (SECTION_DEPENDENCIES[section.id]) {
        // For Final Project and Advanced sections, check dependencies for ALL courses
        // For others (like Core Theory), usually just the first course is the gateway, 
        // but let's be safe and check for all if it's a section-level requirement.

        // Actually, for Core Theory, if you finish Core Math, you unlock the section.
        // Then inside the section, it's sequential.

        const missingDep = SECTION_DEPENDENCIES[section.id].find(depSectionId => {
            const depSection = ossuData.find(s => s.id === depSectionId);
            if (!depSection) return false;
            // Check if all courses in the dependent section are completed
            return !depSection.courses.every(c => progress[c.id]?.status === 'completed');
        });

        if (missingDep) return false;
    }

    // 2. Check Sequential Course Dependency (skip for Final Project)
    if (section.id !== 'final-project' && courseIndex > 0) {
        const prevCourse = section.courses[courseIndex - 1];
        if (progress[prevCourse.id]?.status !== 'completed') {
            return false;
        }
    }

    return true;
};
