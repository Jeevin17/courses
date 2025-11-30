import { createContext, useContext, useState, useEffect } from 'react';
import { ossuData } from '../data/ossu-data';
import { parseDuration } from '../utils/timeUtils';

const OSSUContext = createContext();

const STORAGE_KEY = 'ossu-tracker-data';

export function OSSUProvider({ children }) {
    const [progress, setProgress] = useState({});
    const [notes, setNotes] = useState({});
    const [theme, setTheme] = useState('light');

    const [isInitialized, setIsInitialized] = useState(false);

    // Load data from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setProgress(parsed.progress || {});
                setNotes(parsed.notes || {});
                setTheme(parsed.theme || 'light');
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save data to local storage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, notes, theme }));
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [progress, notes, theme, isInitialized]);

    const updateStatus = (courseId, status) => {
        setProgress(prev => ({
            ...prev,
            [courseId]: { ...prev[courseId], status, lastUpdated: new Date().toISOString() }
        }));
    };

    const addStudyTime = (courseId, minutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            const newTime = (current.timeSpent || 0) + minutes;
            // Auto-update status to 'in-progress' if it was undefined or 'todo'
            const newStatus = (!current.status || current.status === 'todo') ? 'in-progress' : current.status;

            return {
                ...prev,
                [courseId]: {
                    ...current,
                    timeSpent: newTime,
                    status: newStatus,
                    lastUpdated: new Date().toISOString()
                }
            };
        });
    };

    const setStudyTime = (courseId, minutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            let newStatus = current.status;

            if (minutes === 0) {
                newStatus = 'todo';
            } else if (minutes > 0 && (!current.status || current.status === 'todo')) {
                newStatus = 'in-progress';
            }

            return {
                ...prev,
                [courseId]: {
                    ...current,
                    timeSpent: Math.max(0, minutes), // Prevent negative time
                    status: newStatus,
                    lastUpdated: new Date().toISOString()
                }
            };
        });
    };

    const adjustStudyTime = (courseId, deltaMinutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            const currentMinutes = current.timeSpent || 0;
            const newTime = Math.max(0, currentMinutes + deltaMinutes);

            return {
                ...prev,
                [courseId]: {
                    ...current,
                    timeSpent: newTime,
                    lastUpdated: new Date().toISOString()
                }
            };
        });
    };

    const getCourseProgress = (courseId) => {
        const course = ossuData.flatMap(s => s.courses).find(c => c.id === courseId);
        const userProgress = progress[courseId] || {};

        if (!course) return { status: 'todo', timeSpent: 0, progressPercent: 0 };

        const totalMinutes = parseDuration(course.duration, course.effort);
        const timeSpent = userProgress.timeSpent || 0;
        const progressPercent = totalMinutes > 0 ? Math.min(100, (timeSpent / totalMinutes) * 100) : 0;

        return {
            status: userProgress.status || 'todo',
            timeSpent,
            totalMinutes,
            progressPercent
        };
    };

    const saveNote = (courseId, content) => {
        setNotes(prev => ({
            ...prev,
            [courseId]: content
        }));
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const exportData = () => {
        const data = JSON.stringify({ progress, notes, theme }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ossu-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (jsonData) => {
        try {
            const parsed = JSON.parse(jsonData);
            if (parsed.progress) setProgress(parsed.progress);
            if (parsed.notes) setNotes(parsed.notes);
            if (parsed.theme) setTheme(parsed.theme);
        } catch (e) {
            console.error("Failed to import data", e);
            alert("Invalid data file");
        }
    };

    return (
        <OSSUContext.Provider value={{
            progress, notes, theme,
            updateStatus, addStudyTime, setStudyTime, adjustStudyTime, getCourseProgress,
            saveNote, toggleTheme, exportData, importData
        }}>
            {children}
        </OSSUContext.Provider>
    );
}

export function useOSSUStore() {
    return useContext(OSSUContext);
}
