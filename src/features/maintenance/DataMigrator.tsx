import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ossuData } from '../../data/ossu-data';
import { roadmapShData } from '../../data/roadmap-sh-data';
import { physicsData } from '../../data/physics-data';
import { Database } from 'lucide-react';

export function DataMigrator() {
    const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const migrate = async () => {
        setStatus('migrating');
        setLog([]);
        addLog('Starting migration...');

        try {
            // 1. Migrate OSSU Data
            addLog('Migrating OSSU Data...');
            for (const section of ossuData) {
                for (const course of section.courses) {
                    const { error } = await supabase.from('nodes').upsert({
                        title: course.title,
                        type: 'course',
                        slug: course.id,
                        metadata: {
                            provider: course.provider,
                            url: course.url,
                            duration: course.duration,
                            effort: course.effort,
                            section: section.title
                        },
                        visibility: 'public'
                    }, { onConflict: 'slug' });

                    if (error) throw error;
                }
            }
            addLog('OSSU Data migrated.');

            // 2. Migrate Roadmap.sh Data
            addLog('Migrating Roadmap.sh Data...');
            for (const section of roadmapShData) {
                for (const topic of section.topics) {
                    const { error } = await supabase.from('nodes').upsert({
                        title: topic.title,
                        type: 'topic',
                        slug: topic.id,
                        metadata: {
                            url: topic.url,
                            subtopics: topic.subtopics,
                            section: section.title
                        },
                        visibility: 'public'
                    }, { onConflict: 'slug' });

                    if (error) throw error;
                }
            }
            addLog('Roadmap.sh Nodes migrated.');

            // 3. Migrate Physics Data
            addLog('Migrating Physics Data...');
            for (const section of physicsData) {
                for (const topic of section.topics) {
                    const { error } = await supabase.from('nodes').upsert({
                        title: topic.title,
                        type: 'topic',
                        slug: topic.id,
                        metadata: {
                            subtopics: topic.subtopics,
                            section: section.title
                        },
                        visibility: 'public'
                    }, { onConflict: 'slug' });

                    if (error) throw error;
                }
            }
            addLog('Physics Nodes migrated.');

            // 4. Create Edges (Dependencies)
            addLog('Creating Edges...');

            // Helper to find UUID by slug
            const getUuid = async (slug: string) => {
                const { data } = await supabase.from('nodes').select('id').eq('slug', slug).single();
                return data?.id;
            };

            // Roadmap Edges
            for (const section of roadmapShData) {
                for (const topic of section.topics) {
                    if (topic.prerequisites && topic.prerequisites.length > 0) {
                        const targetId = await getUuid(topic.id);
                        if (!targetId) continue;

                        for (const prereqSlug of topic.prerequisites) {
                            const sourceId = await getUuid(prereqSlug);
                            if (sourceId) {
                                await supabase.from('edges').upsert({
                                    source_id: sourceId,
                                    target_id: targetId,
                                    type: 'prerequisite',
                                    visibility: 'public'
                                }, { onConflict: 'source_id,target_id' });
                            }
                        }
                    }
                }
            }

            // Physics Edges
            for (const section of physicsData) {
                for (const topic of section.topics) {
                    if (topic.prerequisites && topic.prerequisites.length > 0) {
                        const targetId = await getUuid(topic.id);
                        if (!targetId) continue;

                        for (const prereqSlug of topic.prerequisites) {
                            const sourceId = await getUuid(prereqSlug);
                            if (sourceId) {
                                await supabase.from('edges').upsert({
                                    source_id: sourceId,
                                    target_id: targetId,
                                    type: 'prerequisite',
                                    visibility: 'public'
                                }, { onConflict: 'source_id,target_id' });
                            }
                        }
                    }
                }
            }
            addLog('Edges created.');

            setStatus('success');
            addLog('Migration Complete!');

        } catch (err: any) {
            console.error(err);
            addLog(`Error: ${err.message}`);
            setStatus('error');
        }
    };

    return (
        <div className="glass-portal p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Database size={20} /> Data Migration
                </h3>
                <button
                    onClick={migrate}
                    disabled={status === 'migrating'}
                    className="btn-mirror px-4 py-2 text-sm"
                >
                    {status === 'migrating' ? 'Migrating...' : 'Seed Database'}
                </button>
            </div>

            <div className="bg-black/5 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-text-secondary">
                {log.length === 0 ? 'Ready to migrate data...' : log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
}
