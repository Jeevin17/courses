import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';

interface RoadmapNodeData {
    label: string;
    status: 'locked' | 'unlocked' | 'completed';
    section?: string;
    isHovered?: boolean;
    subtopics?: any[];
}

const RoadmapNode = ({ data }: NodeProps<RoadmapNodeData>) => {
    const { label, status, isHovered } = data;

    let containerStyle = "bg-gray-900/40 border-white/10 text-gray-300";
    let statusIndicator = "bg-gray-600";
    let glow = "";

    if (status === 'completed') {
        containerStyle = "bg-purple-900/30 border-purple-500/50 text-purple-100";
        statusIndicator = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]";
        glow = "shadow-[0_0_30px_rgba(168,85,247,0.15)]";
    } else if (status === 'unlocked') {
        containerStyle = "bg-blue-900/30 border-blue-500/50 text-blue-100";
        statusIndicator = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]";
        glow = "shadow-[0_0_30px_rgba(59,130,246,0.15)]";
    } else {
        // Locked
        containerStyle = "bg-gray-900/60 border-gray-700/50 text-gray-500";
        statusIndicator = "bg-red-500/50";
    }

    return (
        <div className={`relative group`}>
            {/* Glass Container */}
            <div className={`
                px-6 py-4 rounded-xl border backdrop-blur-md transition-all duration-300
                min-w-[200px] text-center flex flex-col items-center gap-3
                ${containerStyle} ${glow}
                ${isHovered ? 'scale-105 border-opacity-80 bg-opacity-50' : ''}
            `}>
                <Handle type="target" position={Position.Top} className="!bg-gray-400/50 !w-3 !h-1 !rounded-full !-top-1.5" />

                <span className="text-sm font-bold tracking-wide leading-tight drop-shadow-sm">{label}</span>

                {/* Status Dot */}
                <div className={`w-2 h-2 rounded-full ${statusIndicator}`} />

                <Handle type="source" position={Position.Bottom} className="!bg-gray-400/50 !w-3 !h-1 !rounded-full !-bottom-1.5" />
            </div>
        </div>
    );
};

export default memo(RoadmapNode);
