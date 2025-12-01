import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResourceLinkerProps {
    nodeId: string;
    initialResources?: any[];
    onUpdate?: () => void;
}

export function ResourceLinker({ nodeId, initialResources = [], onUpdate }: ResourceLinkerProps) {
    const [resources, setResources] = useState(initialResources);
    const [newUrl, setNewUrl] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [loading, setLoading] = useState(false);

    const addResource = async () => {
        if (!newUrl || !newLabel) return;
        setLoading(true);
        try {
            // In a real app, we'd insert into a 'resources' table linked to the node
            // For now, we'll assume we are updating a JSONB column 'resources' on the node
            // Or inserting into a separate table. Let's assume a separate table 'node_resources' for better normalization
            // But based on the plan, we might just be storing it in the node's metadata or a simple table.

            // Let's use a hypothetical 'node_resources' table
            const { error } = await supabase
                .from('node_resources')
                .insert([{ node_id: nodeId, url: newUrl, label: newLabel, type: 'external' }]);

            if (error) throw error;

            setResources([...resources, { url: newUrl, label: newLabel, type: 'external' }]);
            setNewUrl('');
            setNewLabel('');
            if (onUpdate) onUpdate();
        } catch (e) {
            console.error('Error adding resource:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 bg-glass-surface border border-glass-border rounded-2xl">
            <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <ExternalLink size={16} /> External Resources
            </h3>

            <div className="space-y-2">
                {resources.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-text-primary/5 rounded-lg group">
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate max-w-[200px]">
                            {res.label}
                        </a>
                        <button className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Label (e.g. Course Website)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="flex-1 bg-text-primary/5 border-none rounded-lg text-xs px-3 py-2 text-text-primary placeholder:text-text-secondary focus:ring-1 focus:ring-blue-500"
                />
                <input
                    type="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1 bg-text-primary/5 border-none rounded-lg text-xs px-3 py-2 text-text-primary placeholder:text-text-secondary focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={addResource}
                    disabled={loading || !newUrl || !newLabel}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                </button>
            </div>
        </div>
    );
}
