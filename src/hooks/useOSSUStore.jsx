import { createContext, useContext, useState, useEffect } from 'react';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { parseDuration } from '../utils/timeUtils';
import { supabase } from '../lib/supabase';
import { encryptData, decryptData } from '../utils/encryption';

const OSSUContext = createContext();

const STORAGE_KEY = 'ossu-tracker-data';

// Helper to find course across all data sources
const findCourse = (courseId) => {
    // 1. Check OSSU
    let course = ossuData.flatMap(s => s.courses).find(c => c.id === courseId);
    if (course) return course;

    // 2. Check Physics
    course = physicsData.flatMap(s => [...(s.courses || []), ...(s.topics || [])]).find(c => c.id === courseId);
    if (course) return course;

    // 3. Check Roadmap.sh (Recursive)
    const flatten = (items) => {
        let flat = [];
        items.forEach(item => {
            if (item.courses) flat.push(...item.courses);
            if (item.topics) {
                flat.push(...item.topics);
                flat.push(...flatten(item.topics));
            }
            if (item.id && item.title && !item.courses && !item.topics) flat.push(item);
        });
        return flat;
    };
    course = flatten(roadmapShData).find(c => c.id === courseId);

    return course;
};

export function OSSUProvider({ children }) {
    const [progress, setProgress] = useState({});
    const [notes, setNotes] = useState({});
    const [theme, setTheme] = useState('light');
    const [streak, setStreak] = useState(0);
    const [lastStudyDate, setLastStudyDate] = useState(null);
    const [badges, setBadges] = useState([]);

    const [schedule, setSchedule] = useState({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    });

    const [weeklyHours, setWeeklyHours] = useState(15);

    const [isInitialized, setIsInitialized] = useState(false);

    // --- Supabase State ---
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [announcement, setAnnouncement] = useState('');

    // --- Focus Mode Session State ---
    // activeSessions: { [courseId]: { courseId, timeLeft, isActive, isBreak, totalDuration } }
    const [activeSessions, setActiveSessions] = useState({});

    // Load data from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setProgress(parsed.progress || {});
                setNotes(parsed.notes || {});
                setTheme(parsed.theme || 'light');
                setStreak(parsed.streak || 0);
                setLastStudyDate(parsed.lastStudyDate || null);
                setBadges(parsed.badges || []);
                setSchedule(parsed.schedule || {
                    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
                });
                setWeeklyHours(parsed.weeklyHours || 15);
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        }
        setIsInitialized(true);
        fetchAnnouncement();

        // Load active sessions
        const savedSessions = localStorage.getItem('ossu-active-sessions');
        if (savedSessions) {
            try {
                setActiveSessions(JSON.parse(savedSessions));
            } catch (e) {
                console.error("Failed to parse active sessions", e);
            }
        }
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const { data } = await supabase.from('system_settings').select('value').eq('key', 'announcement').single();
            if (data) {
                try {
                    const parsed = JSON.parse(data.value);
                    // Check expiration
                    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
                        setAnnouncement(null);
                        return;
                    }
                    // Check dismissal
                    const dismissedId = localStorage.getItem('ossu-announcement-dismissed');
                    if (parsed.id && dismissedId === parsed.id) {
                        setAnnouncement(null);
                        return;
                    }
                    setAnnouncement(parsed);
                } catch (e) {
                    // Fallback for old plain text
                    setAnnouncement({ message: data.value });
                }
            }
        } catch (error) {
            console.log('Supabase not configured, skipping announcement fetch');
        }
    };

    const dismissAnnouncement = () => {
        if (announcement) {
            if (announcement.id) {
                localStorage.setItem('ossu-announcement-dismissed', announcement.id);
            }
            setAnnouncement(null);
        }
    };

    // --- Supabase Auth Listener ---
    useEffect(() => {
        try {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                if (session?.user) checkAdmin(session.user.id);
            }).catch(() => { });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    checkAdmin(session.user.id);
                    fetchFromSupabase(session.user.id);
                } else {
                    setIsAdmin(false);
                }
            });

            return () => subscription.unsubscribe();
        } catch (error) {
            console.log('Supabase not configured, skipping auth');
        }
    }, []);

    const checkAdmin = async (userId) => {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
        if (data?.is_admin) setIsAdmin(true);
    };

    // --- Cloud Sync ---
    const syncToSupabase = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const payload = {
                progress, notes, theme, streak, lastStudyDate, badges, schedule, weeklyHours,
                updated_at: new Date().toISOString()
            };
            const encryptedData = await encryptData(payload, user.email);
            const { error } = await supabase
                .from('user_progress')
                .upsert({ user_id: user.id, data: encryptedData }, { onConflict: 'user_id' });
            if (error) throw error;
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchFromSupabase = async (userId) => {
        if (!userId || !user) return;
        setIsSyncing(true);
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('data')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data?.data) {
                const decryptedData = await decryptData(data.data, user.email);
                if (decryptedData) {
                    importState(decryptedData);
                }
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const deleteAccount = async () => {
        if (!user) return;
        try {
            await supabase.from('user_progress').delete().eq('user_id', user.id);
            await supabase.from('profiles').delete().eq('id', user.id);
            // Note: delete_user RPC is assumed to exist or this will fail
            // await supabase.rpc('delete_user'); 
            localStorage.clear();
            await supabase.auth.signOut();
            window.location.reload();
        } catch (error) {
            console.error("Account deletion failed:", error);
            throw error;
        }
    };

    // Apply theme immediately
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Save data to local storage AND Cloud (Debounced)
    useEffect(() => {
        if (!isInitialized) return;
        const timeoutId = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, notes, theme, streak, lastStudyDate, badges, schedule, weeklyHours }));
            if (user) syncToSupabase();
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [progress, notes, theme, streak, lastStudyDate, badges, schedule, weeklyHours, isInitialized, user]);

    // Persist activeSessions
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('ossu-active-sessions', JSON.stringify(activeSessions));
        }
    }, [activeSessions, isInitialized]);

    // Global Timer Interval
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSessions(prev => {
                const next = { ...prev };
                let hasChanges = false;
                Object.keys(next).forEach(id => {
                    if (next[id].isActive && next[id].timeLeft > 0) {
                        next[id] = { ...next[id], timeLeft: next[id].timeLeft - 1 };
                        hasChanges = true;
                    }
                });
                return hasChanges ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- Auth Actions ---
    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const register = async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
    };

    const checkStreak = () => {
        const today = new Date().toISOString().split('T')[0];
        if (lastStudyDate === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastStudyDate === yesterdayStr) {
            setStreak(prev => prev + 1);
        } else {
            setStreak(1);
        }
        setLastStudyDate(today);
    };

    const checkBadges = (currentProgress, currentStreak) => {
        const newBadges = [];
        const completedCount = Object.values(currentProgress).filter(c => c.status === 'completed').length;
        if (completedCount >= 1 && !badges.includes('first-step')) newBadges.push('first-step');
        if (currentStreak >= 3 && !badges.includes('on-fire')) newBadges.push('on-fire');
        if (currentStreak >= 7 && !badges.includes('unstoppable')) newBadges.push('unstoppable');
        if (newBadges.length > 0) {
            setBadges(prev => [...prev, ...newBadges]);
        }
    };

    const updateStatus = (courseId, status) => {
        setProgress(prev => {
            const newProgress = {
                ...prev,
                [courseId]: { ...prev[courseId], status, lastUpdated: new Date().toISOString() }
            };
            if (status === 'completed') checkBadges(newProgress, streak);
            return newProgress;
        });
        if (status === 'in-progress' || status === 'completed') checkStreak();
    };

    const addStudyTime = (courseId, minutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            const newTime = (current.timeSpent || 0) + minutes;
            let newStatus = (!current.status || current.status === 'todo') ? 'in-progress' : current.status;
            const course = findCourse(courseId);
            if (course) {
                const totalMinutes = parseDuration(course.duration, course.effort);
                if (totalMinutes > 0 && newTime >= totalMinutes && newStatus !== 'completed') {
                    newStatus = 'completed';
                }
            }
            return {
                ...prev,
                [courseId]: { ...current, timeSpent: newTime, status: newStatus, lastUpdated: new Date().toISOString() }
            };
        });
        if (minutes > 0) {
            checkStreak();
            setTimeout(() => checkBadges(progress, streak), 0);
        }
    };

    const setStudyTime = (courseId, minutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            let newStatus = current.status;
            if (minutes === 0) newStatus = 'todo';
            else if (minutes > 0 && (!current.status || current.status === 'todo')) newStatus = 'in-progress';
            return {
                ...prev,
                [courseId]: { ...current, timeSpent: Math.max(0, minutes), status: newStatus, lastUpdated: new Date().toISOString() }
            };
        });
    };

    const adjustStudyTime = (courseId, deltaMinutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            const newTime = Math.max(0, (current.timeSpent || 0) + deltaMinutes);
            return {
                ...prev,
                [courseId]: { ...current, timeSpent: newTime, lastUpdated: new Date().toISOString() }
            };
        });
    };

    // --- Session Actions (Multi-Session) ---
    const startSession = (courseId, duration = 25) => {
        setActiveSessions(prev => ({
            ...prev,
            [courseId]: {
                courseId,
                timeLeft: duration * 60,
                isActive: true,
                isBreak: false,
                totalDuration: duration
            }
        }));
    };

    const pauseSession = (courseId) => {
        setActiveSessions(prev => {
            if (!prev[courseId]) return prev;
            return { ...prev, [courseId]: { ...prev[courseId], isActive: false } };
        });
    };

    const resumeSession = (courseId) => {
        setActiveSessions(prev => {
            if (!prev[courseId]) return prev;
            return { ...prev, [courseId]: { ...prev[courseId], isActive: true } };
        });
    };

    const stopSession = (courseId) => {
        setActiveSessions(prev => {
            const next = { ...prev };
            delete next[courseId];
            return next;
        });
    };

    const getCourseProgress = (courseId) => {
        const course = findCourse(courseId);
        const userProgress = progress[courseId] || {};
        if (!course) return { status: 'todo', timeSpent: 0, progressPercent: 0 };
        const totalMinutes = parseDuration(course.duration, course.effort);
        const timeSpent = userProgress.timeSpent || 0;
        const progressPercent = totalMinutes > 0 ? Math.min(100, (timeSpent / totalMinutes) * 100) : 0;
        return { status: userProgress.status || 'todo', timeSpent, totalMinutes, progressPercent };
    };

    const saveNote = (courseId, content) => {
        setNotes(prev => ({ ...prev, [courseId]: content }));
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const addToSchedule = (day, courseId) => {
        setSchedule(prev => {
            if ((prev[day] || []).length >= 5) return prev;
            return { ...prev, [day]: [...(prev[day] || []), courseId] };
        });
        return (schedule[day] || []).length < 5;
    };

    const removeFromSchedule = (day, index) => {
        setSchedule(prev => ({ ...prev, [day]: prev[day].filter((_, i) => i !== index) }));
    };

    const moveCourse = (fromDay, toDay, courseId, fromIndex) => {
        let success = false;
        setSchedule(prev => {
            if ((prev[toDay] || []).length >= 5 && fromDay !== toDay) return prev;
            success = true;
            const newFromDay = prev[fromDay].filter((_, i) => i !== fromIndex);
            const newToDay = [...(prev[toDay] || []), courseId];
            return { ...prev, [fromDay]: newFromDay, [toDay]: newToDay };
        });
        return success;
    };

    const importState = (newState) => {
        if (newState.progress) setProgress(newState.progress);
        if (newState.notes) setNotes(newState.notes);
        if (newState.theme) setTheme(newState.theme);
        if (newState.streak !== undefined) setStreak(newState.streak);
        if (newState.lastStudyDate !== undefined) setLastStudyDate(newState.lastStudyDate);
        if (newState.badges) setBadges(newState.badges);
        if (newState.schedule) setSchedule(newState.schedule);
        if (newState.weeklyHours) setWeeklyHours(newState.weeklyHours);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            progress: newState.progress || progress,
            notes: newState.notes || notes,
            theme: newState.theme || theme,
            streak: newState.streak !== undefined ? newState.streak : streak,
            lastStudyDate: newState.lastStudyDate !== undefined ? newState.lastStudyDate : lastStudyDate,
            badges: newState.badges || badges,
            schedule: newState.schedule || schedule,
            weeklyHours: newState.weeklyHours || weeklyHours
        }));
    };

    return (
        <OSSUContext.Provider value={{
            progress, notes, theme, streak, badges, schedule, weeklyHours,
            user, isAdmin, isSyncing, announcement, login, register, logout, deleteAccount, syncToSupabase, fetchFromSupabase,
            updateStatus, addStudyTime, setStudyTime, adjustStudyTime, getCourseProgress,
            saveNote, toggleTheme, importState,
            addToSchedule, removeFromSchedule, moveCourse, setWeeklyHours,
            activeSessions, startSession, pauseSession, resumeSession, stopSession, findCourse, dismissAnnouncement
        }}>
            {children}
        </OSSUContext.Provider>
    );
}

export function useOSSUStore() {
    return useContext(OSSUContext);
}
