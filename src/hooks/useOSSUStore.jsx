import { createContext, useContext, useState, useEffect } from 'react';
import { ossuData } from '../data/ossu-data';
import { parseDuration } from '../utils/timeUtils';
import { supabase } from '../lib/supabase';
import { encryptData, decryptData } from '../utils/encryption';

const OSSUContext = createContext();

const STORAGE_KEY = 'ossu-tracker-data';

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
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const { data } = await supabase.from('system_settings').select('value').eq('key', 'announcement').single();
            if (data) setAnnouncement(data.value);
        } catch (error) {
            // Silently fail if Supabase is not configured
            console.log('Supabase not configured, skipping announcement fetch');
        }
    };

    // --- Supabase Auth Listener ---
    useEffect(() => {
        try {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                if (session?.user) checkAdmin(session.user.id);
            }).catch(() => {
                // Silently fail if Supabase is not configured
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    checkAdmin(session.user.id);
                    fetchFromSupabase(session.user.id); // Auto-load on login
                } else {
                    setIsAdmin(false);
                }
            });

            return () => subscription.unsubscribe();
        } catch (error) {
            // Supabase not configured, skip auth
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

            // Encrypt the data before storing
            const encryptedData = await encryptData(payload, user.email);

            const { error } = await supabase
                .from('user_progress')
                .upsert({ user_id: user.id, data: encryptedData }, { onConflict: 'user_id' });

            if (error) throw error;
            console.log("Synced to Supabase (encrypted)");
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

            if (error && error.code !== 'PGRST116') throw error; // Ignore 'not found'

            if (data?.data) {
                // Decrypt the data
                const decryptedData = await decryptData(data.data, user.email);
                if (decryptedData) {
                    importState(decryptedData);
                    console.log("Loaded from Supabase (decrypted)");
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
            // Delete user progress
            await supabase.from('user_progress').delete().eq('user_id', user.id);

            // Delete profile
            await supabase.from('profiles').delete().eq('id', user.id);

            // Delete auth user (requires admin privileges or RPC function)
            // Note: This requires a custom RPC function in Supabase
            const { error } = await supabase.rpc('delete_user');

            if (error) throw error;

            // Clear local data
            localStorage.clear();

            // Sign out
            await supabase.auth.signOut();

            // Reload page
            window.location.reload();
        } catch (error) {
            console.error("Account deletion failed:", error);
            throw error;
        }
    };

    // Save data to local storage AND Cloud (Debounced)
    useEffect(() => {
        if (!isInitialized) return;

        const timeoutId = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, notes, theme, streak, lastStudyDate, badges, schedule, weeklyHours }));
            document.documentElement.setAttribute('data-theme', theme);

            // Auto-sync if logged in
            if (user) {
                syncToSupabase();
            }
        }, 2000); // Wait 2 seconds (slightly longer for cloud)

        return () => clearTimeout(timeoutId);
    }, [progress, notes, theme, streak, lastStudyDate, badges, schedule, weeklyHours, isInitialized, user]);

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
        if (lastStudyDate === today) return; // Already studied today

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

        // Badge: First Step (1 course completed)
        if (completedCount >= 1 && !badges.includes('first-step')) newBadges.push('first-step');

        // Badge: On Fire (3 day streak)
        if (currentStreak >= 3 && !badges.includes('on-fire')) newBadges.push('on-fire');

        // Badge: Unstoppable (7 day streak)
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
            if (status === 'completed') {
                checkBadges(newProgress, streak);
            }
            return newProgress;
        });
        if (status === 'in-progress' || status === 'completed') {
            checkStreak();
        }
    };

    const addStudyTime = (courseId, minutes) => {
        setProgress(prev => {
            const current = prev[courseId] || {};
            const newTime = (current.timeSpent || 0) + minutes;
            const newStatus = (!current.status || current.status === 'todo') ? 'in-progress' : current.status;

            const newProgress = {
                ...prev,
                [courseId]: {
                    ...current,
                    timeSpent: newTime,
                    status: newStatus,
                    lastUpdated: new Date().toISOString()
                }
            };
            return newProgress;
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

    // Schedule Actions
    const addToSchedule = (day, courseId) => {
        setSchedule(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), courseId]
        }));
    };

    const removeFromSchedule = (day, index) => {
        setSchedule(prev => ({
            ...prev,
            [day]: prev[day].filter((_, i) => i !== index)
        }));
    };

    const moveCourse = (fromDay, toDay, courseId, fromIndex) => {
        setSchedule(prev => {
            const newFromDay = prev[fromDay].filter((_, i) => i !== fromIndex);
            const newToDay = [...(prev[toDay] || []), courseId];
            return {
                ...prev,
                [fromDay]: newFromDay,
                [toDay]: newToDay
            };
        });
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
            addToSchedule, removeFromSchedule, moveCourse, setWeeklyHours
        }}>
            {children}
        </OSSUContext.Provider>
    );
}

export function useOSSUStore() {
    return useContext(OSSUContext);
}
