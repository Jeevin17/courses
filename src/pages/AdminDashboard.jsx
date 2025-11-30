import { useState, useEffect } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Bell, Settings, Trash2, Search, Activity, BookOpen, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAdmin, announcement } = useOSSUStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, completions: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [announcementDuration, setAnnouncementDuration] = useState(24);
    const [announcementType, setAnnouncementType] = useState('info');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate('/');
            return;
        }
        fetchStats();
        fetchUsers();
        fetchSettings();
    }, [user, isAdmin, navigate]);

    const fetchStats = async () => {
        try {
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            // Mock active users
            const { count: activeUsers } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).gt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
            setStats({ totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, completions: 0 });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
            setUsers(data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('system_settings').select('*');
            if (error) {
                console.error("Error fetching settings:", error);
                if (error.code === '42P01') {
                    alert("Admin Setup Required: Please run the provided ADMIN_SETUP.sql script in Supabase.");
                }
                return;
            }
            if (data) {
                const maint = data.find(s => s.key === 'maintenance_mode');
                if (maint) setMaintenanceMode(maint.value === 'true');
                const ann = data.find(s => s.key === 'announcement');
                if (ann) {
                    try {
                        const parsed = JSON.parse(ann.value);
                        setNewAnnouncement(parsed.message || '');
                        setAnnouncementType(parsed.type || 'info');
                    } catch (e) {
                        setNewAnnouncement(ann.value);
                    }
                }
            }
        } catch (err) {
            console.error("Unexpected error fetching settings:", err);
        }
    };

    const handleAnnouncementSubmit = async () => {
        try {
            const expiresAt = new Date(Date.now() + announcementDuration * 60 * 60 * 1000).toISOString();
            const payload = JSON.stringify({
                message: newAnnouncement,
                type: announcementType,
                expiresAt,
                id: Date.now().toString()
            });

            const { error } = await supabase.from('system_settings').upsert({ key: 'announcement', value: payload });
            if (error) throw error;
            alert('Announcement updated!');
            window.location.reload();
        } catch (error) {
            alert('Failed to update announcement');
        }
    };

    const toggleMaintenance = async () => {
        try {
            const newValue = !maintenanceMode;
            const { error } = await supabase.from('system_settings').upsert({ key: 'maintenance_mode', value: String(newValue) });
            if (error) throw error;
            setMaintenanceMode(newValue);
        } catch (error) {
            alert('Failed to toggle maintenance mode');
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm("Are you sure? This action is irreversible.")) return;
        try {
            await supabase.from('profiles').delete().eq('id', userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="text-red-500" /> Admin Dashboard
                    </h1>
                    <div className="text-sm text-[var(--text-secondary)]">
                        Logged in as {user.email}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
                    <nav className="space-y-2">
                        <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-blue-500/10 text-blue-400 font-bold' : 'hover:bg-[var(--glass-surface)] text-[var(--text-secondary)]'}`}>
                            <Activity size={18} /> Overview
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-500/10 text-blue-400 font-bold' : 'hover:bg-[var(--glass-surface)] text-[var(--text-secondary)]'}`}>
                            <Users size={18} /> Users
                        </button>
                        <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'announcements' ? 'bg-blue-500/10 text-blue-400 font-bold' : 'hover:bg-[var(--glass-surface)] text-[var(--text-secondary)]'}`}>
                            <Bell size={18} /> Announcements
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-blue-500/10 text-blue-400 font-bold' : 'hover:bg-[var(--glass-surface)] text-[var(--text-secondary)]'}`}>
                            <Settings size={18} /> System Settings
                        </button>
                    </nav>

                    <main className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 min-h-[500px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold mb-4">System Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-[var(--bg-void)] rounded-xl border border-[var(--glass-border)]">
                                        <div className="text-[var(--text-secondary)] text-sm mb-1">Total Users</div>
                                        <div className="text-3xl font-bold">{stats.totalUsers}</div>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-void)] rounded-xl border border-[var(--glass-border)]">
                                        <div className="text-[var(--text-secondary)] text-sm mb-1">Active (7d)</div>
                                        <div className="text-3xl font-bold text-green-400">{stats.activeUsers}</div>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-void)] rounded-xl border border-[var(--glass-border)]">
                                        <div className="text-[var(--text-secondary)] text-sm mb-1">Completions</div>
                                        <div className="text-3xl font-bold text-blue-400">{stats.completions}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">User Management</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
                                        <input type="text" placeholder="Search email..." className="pl-9 pr-4 py-2 bg-[var(--bg-void)] rounded-lg border border-[var(--glass-border)] text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-[var(--text-secondary)] border-b border-[var(--glass-border)]">
                                            <tr>
                                                <th className="pb-3 pl-2">Email</th>
                                                <th className="pb-3">Joined</th>
                                                <th className="pb-3">Role</th>
                                                <th className="pb-3 text-right pr-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--glass-border)]">
                                            {loading ? (
                                                <tr><td colSpan="4" className="py-4 text-center">Loading...</td></tr>
                                            ) : users.map(u => (
                                                <tr key={u.id} className="group hover:bg-[var(--bg-void)]/50 transition-colors">
                                                    <td className="py-3 pl-2">{u.email || 'N/A'}</td>
                                                    <td className="py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${u.is_admin ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                            {u.is_admin ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right pr-2">
                                                        <button onClick={() => deleteUser(u.id)} className="p-1 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 rounded transition-colors" title="Delete User">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'announcements' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Global Announcement</h2>
                                <p className="text-sm text-[var(--text-secondary)]">This message will be displayed to all users at the top of the dashboard.</p>
                                <textarea
                                    value={newAnnouncement}
                                    onChange={(e) => setNewAnnouncement(e.target.value)}
                                    className="w-full h-32 bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-xl p-4 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter announcement text..."
                                />
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">Duration (hours):</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={announcementDuration}
                                            onChange={(e) => setAnnouncementDuration(parseInt(e.target.value) || 24)}
                                            className="w-24 bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-lg p-2 text-center"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">Type:</label>
                                        <select
                                            value={announcementType}
                                            onChange={(e) => setAnnouncementType(e.target.value)}
                                            className="bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="info">Info (Blue)</option>
                                            <option value="success">Success (Green)</option>
                                            <option value="warning">Warning (Yellow)</option>
                                            <option value="error">Error (Red)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button onClick={() => setNewAnnouncement('')} className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Clear</button>
                                    <button onClick={handleAnnouncementSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                                        Publish Announcement
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">System Settings</h2>
                                <div className="flex items-center justify-between p-4 bg-[var(--bg-void)] rounded-xl border border-[var(--glass-border)]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Maintenance Mode</h3>
                                            <p className="text-sm text-[var(--text-secondary)]">Prevent non-admin users from accessing the app.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleMaintenance}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-yellow-500' : 'bg-[var(--glass-border)]'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenanceMode ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
