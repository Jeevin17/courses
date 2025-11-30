import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Handle,
    Position,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as dagre from 'dagre';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { checkPrerequisites, getPrerequisite } from '../utils/prerequisites';
import { useNavigate } from 'react-router-dom';
import { Layers, Book, Activity, Search, Filter, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Custom Node Component ---
const RoadmapNode = ({ data }) => {
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

const nodeTypes = {
    roadmap: RoadmapNode,
};

// --- Layout Helper ---
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 100;

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? 'left' : 'top';
        node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';

        // Shift dagre's center-based coords to top-left
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};

function GraphViewContent() {
    const { progress, schedule, addToSchedule } = useOSSUStore();
    const navigate = useNavigate();

    // State
    const [activeCurriculum, setActiveCurriculum] = useState('ossu');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data Source
    const currentData = useMemo(() => {
        switch (activeCurriculum) {
            case 'ossu': return ossuData;
            case 'roadmap': return roadmapShData;
            case 'physics': return physicsData;
            default: return ossuData;
        }
    }, [activeCurriculum]);

    const { fitView } = useReactFlow();

    // --- Build Graph ---
    useEffect(() => {
        const rawNodes = [];
        const rawEdges = [];

        // Flatten items
        let allItems = [];
        currentData.forEach(section => {
            const items = section.courses || section.topics || [];
            items.forEach(item => {
                allItems.push({ ...item, sectionTitle: section.title });
            });
        });

        // Filter
        const filteredItems = allItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const status = progress[item.id]?.status || (checkPrerequisites(item.id, progress) ? 'unlocked' : 'locked');
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'completed' && status === 'completed') ||
                (filterStatus === 'available' && status === 'unlocked') ||
                (filterStatus === 'locked' && status === 'locked');
            return matchesSearch && matchesStatus;
        });

        filteredItems.forEach(item => {
            const status = progress[item.id]?.status === 'completed' ? 'completed' :
                (checkPrerequisites(item.id, progress) ? 'unlocked' : 'locked');

            rawNodes.push({
                id: item.id,
                type: 'roadmap',
                data: {
                    label: item.title,
                    status,
                    section: item.sectionTitle,
                    subtopics: item.subtopics || [] // Pass subtopics to node data
                },
                position: { x: 0, y: 0 } // Layout will fix this
            });

            // Handle explicit prerequisites from data or fallback to OSSU logic
            const prereqIds = item.prerequisites ||
                (activeCurriculum === 'ossu' ? [getPrerequisite(item.id)?.id].filter(Boolean) : []);

            prereqIds.forEach(prereqId => {
                if (filteredItems.find(i => i.id === prereqId)) {
                    rawEdges.push({
                        id: `${prereqId}-${item.id}`,
                        source: prereqId,
                        target: item.id,
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#4B5563', strokeWidth: 2 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#4B5563' },
                    });
                }
            });
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Center graph after layout
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 100);

    }, [currentData, progress, activeCurriculum, searchQuery, filterStatus, setNodes, setEdges, fitView]);

    // --- Handlers ---
    const onNodeClick = useCallback((event, node) => {
        // Check if node has subtopics to expand
        if (node.data.subtopics && node.data.subtopics.length > 0) {
            const isExpanded = nodes.some(n => n.id.startsWith(`${node.id}-sub-`));

            if (isExpanded) {
                // Collapse: Remove sub-nodes and edges
                setNodes(nds => nds.filter(n => !n.id.startsWith(`${node.id}-sub-`)));
                setEdges(eds => eds.filter(e => !e.source.startsWith(`${node.id}-sub-`) && !e.target.startsWith(`${node.id}-sub-`)));
            } else {
                // Expand: Add sub-nodes
                const subNodes = node.data.subtopics.map((sub, index) => {
                    const subId = `${node.id}-sub-${index}`;
                    return {
                        id: subId,
                        type: 'roadmap',
                        data: { label: typeof sub === 'string' ? sub : sub.title, status: 'unlocked' },
                        position: {
                            x: node.position.x + (index % 2 === 0 ? -150 : 150),
                            y: node.position.y + 120 + (Math.floor(index / 2) * 100)
                        },
                        parentNode: undefined, // Keep independent for now or use parentNode if grouping
                    };
                });

                const subEdges = subNodes.map(subNode => ({
                    id: `${node.id}-${subNode.id}`,
                    source: node.id,
                    target: subNode.id,
                    type: 'default',
                    style: { stroke: '#6B7280', strokeDasharray: '5 5' },
                }));

                setNodes(nds => [...nds, ...subNodes]);
                setEdges(eds => [...eds, ...subEdges]);
            }
        } else {
            // Navigate if no subtopics or leaf node
            navigate(`/course/${node.id}`);
        }
    }, [nodes, navigate, setNodes, setEdges]);

    const handleDragStart = (event, nodeType, node) => {
        event.dataTransfer.setData('application/reactflow', node.id);
        event.dataTransfer.effectAllowed = 'move';
    };

    // --- Sidebar Drag & Drop ---
    const handleDrop = (e, day) => {
        e.preventDefault();
        // Placeholder for future drag-drop logic
    };

    return (
        <div className="w-full h-screen bg-[#0B0F19] flex flex-col relative overflow-hidden">

            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Bar */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-[#1F2937]/80 backdrop-blur-md border border-gray-700/50 p-2 rounded-2xl shadow-2xl flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-xs w-32 focus:w-48 transition-all focus:outline-none focus:border-blue-400 text-gray-200 placeholder-gray-500"
                    />
                </div>

                <div className="w-px h-6 bg-gray-700/50" />

                {/* Curriculum */}
                <div className="flex gap-1">
                    <button data-testid="btn-ossu" onClick={() => setActiveCurriculum('ossu')} className={`p-1.5 rounded-lg transition-all ${activeCurriculum === 'ossu' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Layers size={18} /></button>
                    <button data-testid="btn-roadmap" onClick={() => setActiveCurriculum('roadmap')} className={`p-1.5 rounded-lg transition-all ${activeCurriculum === 'roadmap' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Book size={18} /></button>
                    <button data-testid="btn-physics" onClick={() => setActiveCurriculum('physics')} className={`p-1.5 rounded-lg transition-all ${activeCurriculum === 'physics' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Activity size={18} /></button>
                </div>
            </div>

            {/* React Flow Canvas */}
            <div className="flex-1 w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    className="bg-transparent"
                >
                    <Background color="#374151" gap={30} size={1} className="opacity-20" />
                    <Controls className="bg-gray-800/80 border-gray-700/50 fill-gray-200 rounded-xl overflow-hidden shadow-xl" />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.data.status === 'completed') return '#10B981';
                            if (n.data.status === 'unlocked') return '#F59E0B';
                            return '#374151';
                        }}
                        className="bg-gray-900/80 border border-gray-700/50 rounded-xl overflow-hidden shadow-xl"
                        maskColor="rgba(0,0,0,0.6)"
                    />
                </ReactFlow>
            </div>

            {/* Planner Sidebar (Simplified for now) */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isSidebarOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="absolute top-0 right-0 h-full w-80 bg-[#1F2937]/90 backdrop-blur-xl border-l border-gray-700/50 z-50 flex flex-col shadow-2xl"
            >
                <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-100 flex items-center gap-2"><Calendar size={18} className="text-blue-400" /> Weekly Plan</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-700/50 rounded-lg text-gray-400"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="p-3 rounded-xl bg-[#0B0F19]/50 border border-gray-700/50 min-h-[80px]">
                            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{day}</h3>
                            <div className="space-y-1">
                                {schedule[day]?.map((courseId, idx) => (
                                    <div key={`${day}-${courseId}-${idx}`} className="text-xs font-medium text-gray-200 bg-gray-700/50 p-2 rounded-lg border border-gray-600/50 truncate flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        {nodes.find(n => n.id === courseId)?.data?.label || courseId}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-24 right-8 z-40 p-3 rounded-xl bg-[#1F2937]/80 backdrop-blur-md border border-gray-700/50 text-gray-200 shadow-xl hover:scale-105 transition-all"
                >
                    <Calendar size={20} />
                </button>
            )}

        </div>
    );
}

export default function GraphView() {
    return (
        <ReactFlowProvider>
            <GraphViewContent />
        </ReactFlowProvider>
    );
}
