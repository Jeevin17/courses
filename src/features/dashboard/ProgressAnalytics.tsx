import { useMemo } from 'react';
import { useOSSUStore } from '../../hooks/useOSSUStore';
import { ossuData } from '../../data/ossu-data';
import { roadmapShData } from '../../data/roadmap-sh-data';
import { physicsData } from '../../data/physics-data';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

interface ProgressAnalyticsProps {
    activeCurriculum: string;
}

export const ProgressAnalytics = ({ activeCurriculum }: ProgressAnalyticsProps) => {
    const { progress } = useOSSUStore();

    const data = useMemo(() => {
        const currentData = activeCurriculum === 'ossu' ? ossuData :
            activeCurriculum === 'physics' ? physicsData : roadmapShData;

        return currentData.map((section: any) => {
            const items = section.courses || section.topics || [];
            const total = items.length;
            if (total === 0) return null;

            const completed = items.filter((item: any) => progress[item.id]?.status === 'completed').length;
            const percentage = Math.round((completed / total) * 100);

            return {
                subject: section.title.split(' ')[0], // Shorten name for chart
                fullSubject: section.title,
                A: percentage,
                fullMark: 100
            };
        }).filter(Boolean);
    }, [activeCurriculum, progress]);

    return (
        <div className="w-full h-80 relative">
            <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center justify-center gap-2">
                <Activity size={16} className="text-accent-glow" /> Skill Distribution
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="var(--glass-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Progress"
                        dataKey="A"
                        stroke="var(--accent-glow)"
                        strokeWidth={2}
                        fill="var(--accent-glow)"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-void)',
                            borderColor: 'var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        formatter={(value: number) => [`${value}%`, 'Completed']}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
