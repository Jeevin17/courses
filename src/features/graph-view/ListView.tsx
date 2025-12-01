import { Link } from 'react-router-dom';
import { CheckCircle, Lock, Unlock } from 'lucide-react';
import { CourseProgress } from '../../hooks/useOSSUStore';

interface ListViewProps {
    items: any[];
    progress: Record<string, CourseProgress>;
}

export const ListView = ({ items }: ListViewProps) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-4 pb-20">
            {items.map((item) => {
                // const status = progress[item.id]?.status || 'locked'; // You might need to pass checkPrerequisites result here or calculate it
                // Ideally, the parent should pass the calculated status for consistency

                // For now, let's assume 'status' is passed in the item or we derive it. 
                // In GraphView logic, status was calculated. 
                // Let's assume the passed 'items' already have the 'status' property added by the container.
                const itemStatus = item.status || 'locked';

                return (
                    <Link
                        key={item.id}
                        to={`/course/${item.id}`}
                        className={`
                            flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all
                            ${itemStatus === 'completed' ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30' :
                                itemStatus === 'unlocked' ? 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30' :
                                    'bg-gray-900/40 border-gray-700/30 opacity-70 hover:opacity-100'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${itemStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                                itemStatus === 'unlocked' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                {itemStatus === 'completed' ? <CheckCircle size={20} /> :
                                    itemStatus === 'unlocked' ? <Unlock size={20} /> :
                                        <Lock size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary">{item.title}</h3>
                                <p className="text-xs text-text-secondary">{item.sectionTitle}</p>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-text-secondary">
                            {item.duration}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};
