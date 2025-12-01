import { useState, useMemo, Suspense, lazy, useDeferredValue } from 'react';
import { useOSSUStore } from '../../hooks/useOSSUStore';
import { checkPrerequisites } from '../../utils/prerequisites';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Layers, Book, Activity, Search, Calendar, X, List, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListView } from './ListView';

const LazyGraph = lazy(() => import('./LazyGraph'));

export const GraphContainer = () => {
    const { progress, schedule } = useOSSUStore();

    // State
    const [activeCurriculum, setActiveCurriculum] = useState('ossu');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
    const [isPathMode, setIsPathMode] = useState(false);
    const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

    // Data Source - Supabase with Static Fallback
    const { data: nodes = [], isLoading } = useQuery({
        queryKey: ['graph-nodes', activeCurriculum],
        queryFn: async () => {
            // ... (Supabase logic kept same, but we focus on static fallback enhancement)

            // Map UI curriculum keys to DB source keys
            const sourceMap: Record<string, string> = {
                'ossu': 'ossu',
                'roadmap': 'roadmap-sh',
                'physics': 'physics'
            };
            const dbSource = sourceMap[activeCurriculum] || 'ossu';

            let fetchedData = [];
            try {
                const { data, error } = await supabase
                    .from('nodes')
                    .select('id, title, type, metadata, slug')
                    .eq('metadata->>source', dbSource);

                if (!error && data && data.length > 0) {
                    fetchedData = data.map((node: any) => ({
                        id: node.slug || node.id,
                        title: node.title,
                        sectionTitle: node.metadata.section,
                        status: 'locked',
                        ...node.metadata
                    }));
                }
            } catch (e) {
                console.warn('Supabase fetch failed, falling back to static data', e);
            }

            if (fetchedData.length > 0) return fetchedData;

            // Fallback to static data
            let staticData: any[] = [];
            if (activeCurriculum === 'ossu') {
                const { ossuData } = await import('../../data/ossu-data');
                staticData = ossuData;
            } else if (activeCurriculum === 'roadmap') {
                const { roadmapShData } = await import('../../data/roadmap-sh-data');
                staticData = roadmapShData;
            } else {
                const { physicsData } = await import('../../data/physics-data');
                staticData = physicsData;
            }

            // Flatten and Generate Prerequisites
            const flattened: any[] = [];
            const idMap = new Map<string, any>();

            // First pass: Flatten
            staticData.forEach((section: any) => {
                const items = section.courses || section.topics || [];
                items.forEach((item: any) => {
                    const node = {
                        id: item.id,
                        title: item.title,
                        sectionTitle: section.title,
                        sectionId: section.id,
                        status: 'locked',
                        prerequisites: [] as string[],
                        ...item
                    };
                    flattened.push(node);
                    idMap.set(node.id, node);
                });
            });

            // Second pass: Generate Dependencies
            // We need SECTION_DEPENDENCIES from prerequisites.ts logic, but simplified here
            const SECTION_DEPS: Record<string, string[]> = {
                'core-theory': ['core-math'],
                'advanced-systems': ['prerequisites'],
                'advanced-programming': ['core-programming', 'core-math', 'core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'],
                'advanced-math': ['core-programming'], // Simplified
                'final-project': ['advanced-programming', 'advanced-systems'] // Simplified
            };

            staticData.forEach((section: any) => {
                const items = section.courses || section.topics || [];
                items.forEach((item: any, index: number) => {
                    const node = idMap.get(item.id);
                    if (!node) return;

                    // 1. Sequential Dependency
                    if (index > 0) {
                        const prev = items[index - 1];
                        node.prerequisites.push(prev.id);
                    }

                    // 2. Section Dependency (for first item)
                    if (index === 0 && SECTION_DEPS[section.id]) {
                        SECTION_DEPS[section.id].forEach(depSecId => {
                            // Find last course of dep section
                            const depSec = staticData.find(s => s.id === depSecId);
                            if (depSec && depSec.courses?.length) {
                                const lastCourse = depSec.courses[depSec.courses.length - 1];
                                node.prerequisites.push(lastCourse.id);
                            }
                        });
                    }
                });
            });

            return flattened;
        }
    });

    // Optimize Search Performance (INP Fix)
    const deferredSearchQuery = useDeferredValue(searchQuery);

    // Path Tracing Logic
    const tracePath = useMemo(() => {
        if (!targetNodeId || !nodes.length) return new Set<string>();

        const path = new Set<string>();
        const stack = [targetNodeId];
        const visited = new Set<string>();

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            path.add(currentId);

            const node = nodes.find((n: any) => n.id === currentId);
            if (node && node.prerequisites) {
                stack.push(...node.prerequisites);
            }
        }
        return path;
    }, [targetNodeId, nodes]);

    // Process Data with Status & Filtering
    const processedItems = useMemo(() => {
        if (!nodes.length) return [];

        return nodes.map((item: any) => {
            const matchesSearch = item.title.toLowerCase().includes(deferredSearchQuery.toLowerCase());

            // Path Mode Filter
            if (isPathMode && targetNodeId && !tracePath.has(item.id)) {
                return null;
            }

            // Check status from store or simple logic
            const status = (progress[item.id]?.status || (checkPrerequisites(item.id, progress) ? 'unlocked' : 'locked')) as any;

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'completed' && status === 'completed') ||
                (filterStatus === 'available' && status === 'unlocked') ||
                (filterStatus === 'locked' && status === 'locked');

            return matchesSearch && matchesStatus ? { ...item, status } : null;
        }).filter(Boolean) as any[];
    }, [nodes, deferredSearchQuery, filterStatus, progress, isPathMode, targetNodeId, tracePath]);

    const handleNodeSelect = (nodeId: string) => {
        if (isPathMode) {
            setTargetNodeId(nodeId === targetNodeId ? null : nodeId);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-bg-void text-text-secondary">Loading Knowledge Graph...</div>;
    }

    return (
        <div className="w-full h-screen bg-bg-void flex flex-col relative overflow-hidden text-text-primary">

            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Bar */}
            <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-glass-surface backdrop-blur-md border border-glass-border p-2 rounded-2xl shadow-2xl flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-bg-void/50 border border-glass-border rounded-xl text-xs w-32 focus:w-48 transition-all focus:outline-none focus:border-accent-glow text-text-primary placeholder-text-secondary"
                    />
                </div>

                <div className="w-px h-6 bg-glass-border" />

                {/* Curriculum */}
                <div className="flex gap-1">
                    <button onClick={() => setActiveCurriculum('ossu')} className={`p-1.5 rounded-lg transition-all ${activeCurriculum === 'ossu' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}><Layers size={18} /></button>
                    <button onClick={() => setActiveCurriculum('roadmap')} className={`p-1.5 rounded-lg transition-all ${activeCurriculum === 'roadmap' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}><Book size={18} /></button>
                    <button onClick={() => setActiveCurriculum('physics')} className={`p-1.5 rounded-lg transition-all ${activeCurriculum === 'physics' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}><Activity size={18} /></button>
                </div>

                <div className="w-px h-6 bg-glass-border" />

                {/* View Toggle */}
                <div className="flex gap-1">
                    <button onClick={() => setViewMode('graph')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'graph' ? 'bg-accent-glow text-black shadow-lg shadow-accent-glow/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}><Network size={18} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-accent-glow text-black shadow-lg shadow-accent-glow/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}><List size={18} /></button>
                </div>

                <div className="w-px h-6 bg-glass-border" />

                {/* Path Mode Toggle */}
                <button
                    onClick={() => { setIsPathMode(!isPathMode); setTargetNodeId(null); }}
                    className={`p-1.5 rounded-lg transition-all ${isPathMode ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                    title="Path Mode (Click node to trace)"
                >
                    <Network size={18} className={isPathMode ? "animate-pulse" : ""} />
                </button>

                <div className="w-px h-6 bg-glass-border" />

                {/* Planner Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`p-1.5 rounded-lg transition-all ${isSidebarOpen ? 'bg-accent-glow text-black shadow-lg shadow-accent-glow/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    <Calendar size={18} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full h-full overflow-hidden">
                {viewMode === 'graph' ? (
                    <Suspense fallback={<div className="flex items-center justify-center h-full text-text-secondary">Loading Graph...</div>}>
                        <LazyGraph
                            items={processedItems}
                            activeCurriculum={activeCurriculum}
                            onNodeSelect={isPathMode ? handleNodeSelect : undefined}
                        />
                    </Suspense>
                ) : (
                    <div className="h-full overflow-y-auto pt-32">
                        <ListView items={processedItems} progress={progress} />
                    </div>
                )}
            </div>

            {/* Planner Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="absolute top-0 right-0 h-full w-80 bg-glass-surface backdrop-blur-xl border-l border-glass-border z-50 flex flex-col shadow-2xl"
                    >
                        <div className="p-4 border-b border-glass-border flex justify-between items-center">
                            <h2 className="font-bold text-text-primary flex items-center gap-2"><Calendar size={18} className="text-accent-glow" /> Weekly Plan</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-text-secondary"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <div key={day} className="p-3 rounded-xl bg-bg-void/50 border border-glass-border min-h-[80px]">
                                    <h3 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">{day}</h3>
                                    <div className="space-y-1">
                                        {schedule[day]?.map((courseId: string, idx: number) => (
                                            <div key={`${day}-${courseId}-${idx}`} className="text-xs font-medium text-text-primary bg-white/5 p-2 rounded-lg border border-white/10 truncate flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent-glow" />
                                                {processedItems.find(n => n.id === courseId)?.title || courseId}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
