import { useState, useMemo, useRef } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { checkPrerequisites, getPrerequisite } from '../utils/prerequisites';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, Unlock, ZoomIn, ZoomOut, Move, BrainCircuit } from 'lucide-react';

export default function GraphView() {
    const { progress } = useOSSUStore();
    const navigate = useNavigate();
    const [hoveredNode, setHoveredNode] = useState(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const containerRef = useRef(null);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // --- Neural Network Layout Calculation ---
    const { nodes, edges } = useMemo(() => {
        const nodes = [];
        const edges = [];

        // Configuration
        const layerSpacing = 300; // Horizontal space between layers
        const nodeSpacing = 60;   // Vertical space between nodes
        const startX = 100;
        const startY = 100;

        // Define Layers
        const layers = [
            { id: 'input', title: 'Input Layer', sections: ['intro-cs'] },
            { id: 'hidden-1', title: 'Core Layer 1', sections: ['core-programming', 'core-math', 'cs-tools'] },
            { id: 'hidden-2', title: 'Core Layer 2', sections: ['core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'] },
            { id: 'hidden-3', title: 'Advanced Layer', sections: ['advanced-programming', 'advanced-systems', 'advanced-theory', 'advanced-security', 'advanced-math'] },
            { id: 'output', title: 'Output Layer', sections: ['final-project'] }
        ];

        // Process each layer
        layers.forEach((layer, layerIndex) => {
            const layerX = startX + layerIndex * layerSpacing;

            // Gather all courses for this layer
            let layerCourses = [];
            layer.sections.forEach(sectionId => {
                const section = ossuData.find(s => s.id === sectionId);
                if (section) {
                    layerCourses.push(...section.courses.map(c => ({ ...c, sectionTitle: section.title })));
                }
            });

            // Calculate vertical centering
            const layerHeight = layerCourses.length * nodeSpacing;
            const totalGraphHeight = 800; // Approximate
            const startLayerY = startY + (totalGraphHeight - layerHeight) / 2;

            // Create nodes for courses
            layerCourses.forEach((course, index) => {
                const nodeY = startLayerY + index * nodeSpacing;

                const isUnlocked = checkPrerequisites(course.id, progress);
                const isCompleted = progress[course.id]?.status === 'completed';
                const prereq = getPrerequisite(course.id);

                nodes.push({
                    id: course.id,
                    x: layerX,
                    y: nodeY,
                    label: course.title,
                    section: course.sectionTitle,
                    type: 'neuron',
                    layer: layerIndex,
                    status: isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked'),
                    prereqId: prereq?.id
                });

                // Create edges (Synapses)
                if (prereq) {
                    // Dependency edge
                    edges.push({ source: prereq.id, target: course.id, type: 'synapse' });
                } else if (layerIndex > 0) {
                    // If no direct prereq, connect to a representative node from previous layer (visual flow)
                    // For simplicity, we only show direct dependencies to avoid clutter, 
                    // OR we could connect to the "nearest" node in previous layer for the "neural net" look.
                    // Let's stick to strict dependencies for now to keep it meaningful.
                }
            });

            // Add Layer Label Node (Visual only)
            nodes.push({
                id: `layer-${layer.id}`,
                x: layerX,
                y: 50,
                label: layer.title,
                type: 'label',
                layer: layerIndex
            });
        });

        return { nodes, edges };
    }, [progress]);

    // --- Interaction Handlers ---
    const handleWheel = (e) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.2, transform.scale + scaleAmount), 3);
        setTransform(prev => ({ ...prev, scale: newScale }));
    };

    const handleMouseDown = (e) => {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (isDragging.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[var(--bg-void)]">

            {/* Controls */}
            <div className="absolute top-24 right-8 z-50 flex flex-col gap-2">
                <button
                    onClick={() => setTransform(t => ({ ...t, scale: t.scale + 0.2 }))}
                    className="p-2 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={() => setTransform(t => ({ ...t, scale: t.scale - 0.2 }))}
                    className="p-2 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors"
                >
                    <ZoomOut size={20} />
                </button>
                <button
                    onClick={() => setTransform({ x: -200, y: -100, scale: 0.6 })} // Reset to a good overview
                    className="p-2 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors"
                >
                    <Move size={20} />
                </button>
            </div>

            {/* Graph Canvas */}
            <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <motion.div
                    className="w-full h-full origin-top-left"
                    animate={{
                        x: transform.x,
                        y: transform.y,
                        scale: transform.scale
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <svg width="2000" height="1500" className="overflow-visible">
                        <defs>
                            <filter id="neuron-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <linearGradient id="synapse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>

                        {/* Edges (Synapses) */}
                        {edges.map((edge, i) => {
                            const source = nodes.find(n => n.id === edge.source);
                            const target = nodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;

                            const isHovered = hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id);
                            const isDimmed = hoveredNode && !isHovered;

                            return (
                                <motion.path
                                    key={`${edge.source}-${edge.target}`}
                                    d={`M ${source.x} ${source.y} C ${source.x + 100} ${source.y}, ${target.x - 100} ${target.y}, ${target.x} ${target.y}`}
                                    stroke={isHovered ? "var(--accent-glow)" : "var(--text-primary)"}
                                    strokeWidth={isHovered ? 3 : 1}
                                    strokeOpacity={isHovered ? 0.8 : (isDimmed ? 0.05 : 0.2)}
                                    fill="none"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: i * 0.01 }}
                                />
                            );
                        })}

                        {/* Nodes (Neurons) */}
                        {nodes.map((node, i) => {
                            if (node.type === 'label') {
                                return (
                                    <text
                                        key={node.id}
                                        x={node.x}
                                        y={node.y}
                                        textAnchor="middle"
                                        className="text-sm font-bold fill-[var(--text-secondary)] uppercase tracking-widest"
                                    >
                                        {node.label}
                                    </text>
                                );
                            }

                            const isHovered = hoveredNode?.id === node.id;
                            const isDimmed = hoveredNode && !isHovered &&
                                !edges.some(e => (e.source === node.id && e.target === hoveredNode.id) || (e.target === node.id && e.source === hoveredNode.id));

                            return (
                                <motion.g
                                    key={node.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: isHovered ? 1.2 : 1,
                                        opacity: isDimmed ? 0.1 : 1
                                    }}
                                    transition={{ duration: 0.3, delay: node.layer * 0.1 + (i % 10) * 0.05 }}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/study?id=${node.id}`);
                                    }}
                                    className="cursor-pointer"
                                >
                                    {/* Outer Glow */}
                                    <circle
                                        cx={node.x} cy={node.y} r={15}
                                        fill={
                                            node.status === 'completed' ? "var(--accent-glow)" :
                                                node.status === 'locked' ? "red" :
                                                    "var(--text-primary)"
                                        }
                                        opacity={node.status === 'completed' ? 0.4 : 0.1}
                                        className="blur-sm"
                                    />

                                    {/* Core Neuron */}
                                    <circle
                                        cx={node.x} cy={node.y} r={6}
                                        fill={
                                            node.status === 'completed' ? "var(--accent-glow)" :
                                                node.status === 'locked' ? "var(--bg-void)" :
                                                    "var(--glass-surface)"
                                        }
                                        stroke={
                                            node.status === 'completed' ? "#fff" :
                                                node.status === 'locked' ? "#ef4444" :
                                                    "var(--text-primary)"
                                        }
                                        strokeWidth={2}
                                    />

                                    {/* Label */}
                                    <text
                                        x={node.x + 20}
                                        y={node.y + 4}
                                        className={`text-[10px] font-medium transition-colors ${isHovered ? "fill-[var(--text-primary)] font-bold text-xs" :
                                                node.status === 'locked' ? "fill-[var(--text-secondary)] opacity-50" :
                                                    "fill-[var(--text-secondary)]"
                                            }`}
                                    >
                                        {node.label}
                                    </text>

                                    {/* Status Icon */}
                                    {node.status === 'locked' && (
                                        <Lock x={node.x - 15} y={node.y - 15} size={10} className="text-red-500" />
                                    )}
                                    {node.status === 'completed' && (
                                        <Check x={node.x - 15} y={node.y - 15} size={10} className="text-green-400" />
                                    )}

                                </motion.g>
                            );
                        })}
                    </svg>
                </motion.div>
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredNode && hoveredNode.type !== 'label' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="fixed pointer-events-none bg-[var(--glass-surface)] backdrop-blur-xl border border-[var(--glass-border)] p-4 rounded-2xl shadow-2xl z-50 min-w-[250px]"
                        style={{
                            left: 20,
                            bottom: 20,
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <BrainCircuit className="text-[var(--text-primary)]" size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">{hoveredNode.section}</span>
                        </div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-2 text-lg leading-tight">{hoveredNode.label}</h3>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {hoveredNode.status === 'locked' ? (
                                    <span className="text-red-400 flex items-center gap-1 text-xs font-bold bg-red-500/10 px-2 py-1 rounded"><Lock size={12} /> Locked</span>
                                ) : hoveredNode.status === 'completed' ? (
                                    <span className="text-green-400 flex items-center gap-1 text-xs font-bold bg-green-500/10 px-2 py-1 rounded"><Check size={12} /> Completed</span>
                                ) : (
                                    <span className="text-blue-400 flex items-center gap-1 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded"><Unlock size={12} /> Available</span>
                                )}
                            </div>

                            {hoveredNode.prereqId && (
                                <div className="p-3 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/5">
                                    <span className="text-[10px] uppercase tracking-wider opacity-50 block mb-1">Input Signal (Prerequisite)</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">
                                        {ossuData.flatMap(s => s.courses).find(c => c.id === hoveredNode.prereqId)?.title}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
