
import { useMemo, useState } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { motion } from 'framer-motion';
import { Activity, PieChart as PieChartIcon, TrendingUp, Filter } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { DataMigrator } from '../features/maintenance/DataMigrator';

export default function Analytics() {
    const { progress, weeklyHours, isAdmin } = useOSSUStore();
    const [selectedCurriculum, setSelectedCurriculum] = useState<'all' | 'ossu' | 'roadmap-sh' | 'physics'>('all');

    // Helper to get all courses/topics based on selection
    const filteredItems = useMemo(() => {
        let items: any[] = [];
        if (selectedCurriculum === 'all' || selectedCurriculum === 'ossu') {
            items = [...items, ...ossuData.flatMap((s: any) => s.courses || [])];
        }
        if (selectedCurriculum === 'all' || selectedCurriculum === 'roadmap-sh') {
            items = [...items, ...roadmapShData.flatMap((s: any) => s.topics || [])];
        }
        if (selectedCurriculum === 'all' || selectedCurriculum === 'physics') {
            items = [...items, ...physicsData.flatMap((s: any) => s.topics || [])];
        }
        return items;
    }, [selectedCurriculum]);

    // 1. Skill Distribution (Radar)
    const skillData = useMemo(() => {
        if (selectedCurriculum === 'all') {
            // Compare Curricula Progress
            const curricula = [
                { id: 'ossu', label: 'OSSU', data: ossuData, key: 'courses' },
                { id: 'roadmap-sh', label: 'Roadmap', data: roadmapShData, key: 'topics' },
                { id: 'physics', label: 'Physics', data: physicsData, key: 'topics' }
            ];
            return curricula.map(c => {
                const items = c.data.flatMap((s: any) => s[c.key] || []);
                const total = items.length;
                const completed = items.filter((i: any) => progress[i.id]?.status === 'completed').length;
                return {
                    subject: c.label,
                    A: total ? Math.round((completed / total) * 100) : 0,
                    fullMark: 100
                };
            });
        } else {
            // Show Sections for specific curriculum
            let sourceData: any[] = [];
            let itemKey = 'courses';
            if (selectedCurriculum === 'ossu') { sourceData = ossuData; itemKey = 'courses'; }
            else if (selectedCurriculum === 'roadmap-sh') { sourceData = roadmapShData; itemKey = 'topics'; }
            else if (selectedCurriculum === 'physics') { sourceData = physicsData; itemKey = 'topics'; }

            return sourceData.map((section: any) => {
                const items = section[itemKey] || [];
                const total = items.length;
                if (total === 0) return null;
                const completed = items.filter((item: any) => progress[item.id]?.status === 'completed').length;
                return {
                    subject: section.title.split(' ')[0], // Shorten title
                    A: Math.round((completed / total) * 100),
                    fullMark: 100
                };
            }).filter(Boolean);
        }
    }, [progress, selectedCurriculum]);

    // 2. Course Status Distribution (Pie)
    const statusData = useMemo(() => {
        const counts = { completed: 0, in_progress: 0, todo: 0 };
        filteredItems.forEach((c: any) => {
            const status = progress[c.id]?.status || 'todo';
            if (status === 'completed') counts.completed++;
            else if (status === 'in-progress') counts.in_progress++;
            else counts.todo++;
        });

        return [
            { name: 'Completed', value: counts.completed, color: '#10B981' }, // Green
            { name: 'In Progress', value: counts.in_progress, color: '#3B82F6' }, // Blue
            { name: 'To Do', value: counts.todo, color: 'var(--text-secondary)' } // Gray
        ];
    }, [progress, filteredItems]);

    // 3. Projected Completion (Area)
    const projectionData = useMemo(() => {
        const total = filteredItems.length;
        if (total === 0) return [];
        const completed = filteredItems.filter((c: any) => progress[c.id]?.status === 'completed').length;
        const rate = Math.round((completed / total) * 100) || 0;

        const data = [];
        const today = new Date();
        for (let i = 0; i <= 12; i++) { // 12 Months projection
            const date = new Date(today);
            date.setMonth(today.getMonth() + i);
            // Simple linear projection based on weekly hours goal vs total items (assuming 1 item ~ 10 hours avg for simplicity if no duration)
            // Or just project based on current % + constant growth
            // Let's assume 1 item takes ~15 hours on average across all curricula
            const estimatedHoursRemaining = (total - completed) * 15;
            const hoursPerMonth = weeklyHours * 4;
            const monthsToComplete = estimatedHoursRemaining / hoursPerMonth;

            // Calculate % progress added per month
            const percentPerMonth = (hoursPerMonth / (total * 15)) * 100;

            const projected = Math.min(100, rate + (percentPerMonth * i));

            data.push({
                name: date.toLocaleDateString('en-US', { month: 'short' }),
                value: Math.round(projected)
            });
        }
        return data;
    }, [progress, weeklyHours, filteredItems]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl space-y-8 pb-20"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-display font-bold text-text-primary">Analytics</h1>
                    <p className="text-text-secondary mt-1">Deep dive into your learning progress.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Curriculum Filter */}
                    <div className="flex items-center gap-2 bg-glass-surface border border-glass-border rounded-xl p-1">
                        <button
                            onClick={() => setSelectedCurriculum('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCurriculum === 'all' ? 'bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedCurriculum('ossu')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCurriculum === 'ossu' ? 'bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            OSSU
                        </button>
                        <button
                            onClick={() => setSelectedCurriculum('roadmap-sh')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCurriculum === 'roadmap-sh' ? 'bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Roadmap
                        </button>
                        <button
                            onClick={() => setSelectedCurriculum('physics')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCurriculum === 'physics' ? 'bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Physics
                        </button>
                    </div>

                    <div className="px-4 py-2 bg-text-primary/5 rounded-xl text-sm font-medium text-text-primary whitespace-nowrap">
                        {weeklyHours}h / Week
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Status Distribution (Pie) */}
                <div className="glass-portal p-6 rounded-3xl flex flex-col items-center justify-center">
                    <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2 w-full">
                        <PieChartIcon size={16} /> Course Status
                    </h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-void)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-4">
                        {statusData.map(d => (
                            <div key={d.name} className="flex items-center gap-2 text-xs text-text-secondary">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.name} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Skill Radar */}
                <div className="glass-portal p-6 rounded-3xl col-span-1 md:col-span-1 lg:col-span-2">
                    <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
                        <Activity size={16} />
                        {selectedCurriculum === 'all' ? 'Curriculum Progress' : 'Skill Distribution'}
                    </h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                <PolarGrid stroke="var(--glass-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Proficiency"
                                    dataKey="A"
                                    stroke="var(--accent-glow)"
                                    strokeWidth={3}
                                    fill="var(--accent-glow)"
                                    fillOpacity={0.2}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-void)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    formatter={(value: number) => [`${value}%`, 'Completed']}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Projection (Area) */}
                <div className="glass-portal p-6 rounded-3xl col-span-1 md:col-span-2 lg:col-span-3">
                    <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
                        <TrendingUp size={16} /> 12-Month Projection
                    </h3>
                    <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-glow)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-glow)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-void)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent-glow)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Migration Tool (Admin Only) */}
                {isAdmin && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <DataMigrator />
                    </div>
                )}

            </div>
        </motion.div>
    );
}
