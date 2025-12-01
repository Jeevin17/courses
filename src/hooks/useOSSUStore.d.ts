export interface CourseProgress {
    status: 'todo' | 'in-progress' | 'completed';
    timeSpent: number;
    lastUpdated?: string;
}

export interface Session {
    courseId: string;
    timeLeft: number;
    isActive: boolean;
    isBreak: boolean;
    totalDuration: number;
}

export interface OSSUStore {
    progress: Record<string, CourseProgress>;
    notes: Record<string, string>;
    theme: 'light' | 'dark';
    streak: number;
    badges: string[];
    schedule: Record<string, string[]>;
    weeklyHours: number;
    user: any;
    isAdmin: boolean;
    isSyncing: boolean;
    announcement: any;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    syncToSupabase: () => Promise<void>;
    fetchFromSupabase: (userId: string) => Promise<void>;

    updateStatus: (courseId: string, status: string) => void;
    addStudyTime: (courseId: string, minutes: number) => void;
    setStudyTime: (courseId: string, minutes: number) => void;
    adjustStudyTime: (courseId: string, deltaMinutes: number) => void;
    getCourseProgress: (courseId: string) => { status: string; timeSpent: number; totalMinutes: number; progressPercent: number };

    saveNote: (courseId: string, content: string) => void;
    toggleTheme: () => void;
    importState: (newState: any) => void;

    addToSchedule: (day: string, courseId: string) => boolean;
    removeFromSchedule: (day: string, index: number) => void;
    moveCourse: (fromDay: string, toDay: string, courseId: string, fromIndex: number) => boolean;
    setWeeklyHours: (hours: number) => void;

    activeSessions: Record<string, Session>;
    startSession: (courseId: string, duration?: number) => void;
    pauseSession: (courseId: string) => void;
    resumeSession: (courseId: string) => void;
    stopSession: (courseId: string) => void;
    findCourse: (courseId: string) => any;
    dismissAnnouncement: () => void;
}

export function useOSSUStore(): OSSUStore;
export function OSSUProvider({ children }: { children: React.ReactNode }): JSX.Element;
