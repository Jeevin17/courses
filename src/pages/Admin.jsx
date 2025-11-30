import { useState, useEffect } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Save, Users } from 'lucide-react';

export default function Admin() {
    const { isAdmin, user } = useOSSUStore();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!isAdmin && !user) {
            navigate('/');
        } else {
            fetchSettings();
        }
    }, [isAdmin, user, navigate]);

    const fetchSettings = async () => {
        const { data } = await supabase.from('system_settings').select('value').eq('key', 'announcement').single();
        if (data) setAnnouncement(data.value);
    };

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('system_settings')
            .upsert({ key: 'announcement', value: announcement }, { onConflict: 'key' });

        setLoading(false);
        if (error) {
            setMsg('Error saving settings');
        } else {
            setMsg('Settings saved successfully');
        }
    };

    if (!isAdmin) return <div className="p-10 text-center">Access Denied</div>;

    return (
        <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
                <ShieldAlert className="text-red-500" /> Admin Dashboard
            </h1>

            <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users size={20} /> Global Announcement
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    This message will be displayed to all users on the dashboard.
                </p>
                <textarea
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full h-32 bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter announcement markdown..."
                />
                <div className="flex justify-between items-center mt-4">
                    <span className="text-green-400 text-sm">{msg}</span>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Announcement'}
                    </button>
                </div>
            </div>
        </div>
    );
}
