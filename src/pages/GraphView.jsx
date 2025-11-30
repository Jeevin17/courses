import { useState, useMemo, useRef, useEffect } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { checkPrerequisites, getPrerequisite } from '../utils/prerequisites';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, Unlock, ZoomIn, ZoomOut, Move, BrainCircuit, Book, Activity, Layers } from 'lucide-react';

export default function GraphView() {
    const { progress } = useOSSUStore();
    const navigate = useNavigate();
    const [activeCurriculum, setActiveCurriculum] = useState('ossu'); // 'ossu', 'roadmap', 'physics'
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

        let layers = [];
        let currentData = [];

        // Define Layers based on Curriculum
        if (activeCurriculum === 'ossu') {
            currentData = ossuData;
            layers = [
                { id: 'input', title: 'Input Layer', sections: ['intro-cs'] },
                { id: 'hidden-1', title: 'Core Layer 1', sections: ['core-programming', 'core-math', 'cs-tools'] },
                { id: 'hidden-2', title: 'Core Layer 2', sections: ['core-systems', 'core-theory', 'core-security', 'core-applications', 'core-ethics'] },
                { id: 'hidden-3', title: 'Advanced Layer', sections: ['advanced-programming', 'advanced-systems', 'advanced-theory', 'advanced-security', 'advanced-math'] },
                { id: 'output', title: 'Output Layer', sections: ['final-project'] }
            ];
        } else if (activeCurriculum === 'roadmap') {
            currentData = roadmapShData;
            layers = [
                { id: 'layer-1', title: 'Foundations', sections: ['sh-sec-1'] },
                { id: 'layer-2', title: 'Core Concepts', sections: ['sh-sec-2', 'sh-sec-3'] },
                { id: 'layer-3', title: 'Tools & Practices', sections: ['sh-sec-4', 'sh-sec-5'] },
                { id: 'layer-4', title: 'Data & Math', sections: ['sh-sec-6', 'sh-sec-7-discrete', 'sh-sec-7-continuous'] },
                { id: 'layer-5', title: 'Advanced Theory', sections: ['sh-sec-8', 'sh-sec-9-arch'] }
            ];
        } else if (activeCurriculum === 'physics') {
            currentData = physicsData;
            layers = [
                { id: 'layer-1', title: 'Classical', sections: ['phy-A'] },
                { id: 'layer-2', title: 'Electromagnetism', sections: ['phy-B'] },
                { id: 'layer-3', title: 'Thermo & Quantum', sections: ['phy-C', 'phy-D'] },
                { id: 'layer-4', title: 'Advanced Theory', sections: ['phy-E', 'phy-F'] },
                { id: 'layer-5', title: 'Particles & Matter', sections: ['phy-G', 'phy-H'] },
                { id: 'layer-6', title: 'Specialized', sections: ['phy-I', 'phy-J', 'phy-K', 'phy-L', 'phy-M'] }
            ];
        }

        // Process each layer
        layers.forEach((layer, layerIndex) => {
            const layerX = startX + layerIndex * layerSpacing;

            // Gather all courses/topics for this layer
            let layerItems = [];
            layer.sections.forEach(sectionId => {
                const section = currentData.find(s => s.id === sectionId);
                if (section) {
                    // Handle different data structures (courses vs topics)
                    const items = section.courses || section.topics || [];
                    layerItems.push(...items.map(c => ({ ...c, sectionTitle: section.title })));
                }
            });

            // Calculate vertical centering
            const layerHeight = layerItems.length * nodeSpacing;
            const totalGraphHeight = Math.max(800, layerHeight + 200);
            const startLayerY = startY + (800 - layerHeight) / 2; // Center based on fixed height for stability

            // Create nodes
            layerItems.forEach((item, index) => {
                const nodeY = startLayerY + index * nodeSpacing;

                // Prerequisite check might need adjustment for non-OSSU if they don't use the same ID system
                // For now, we assume checkPrerequisites handles it or returns true if no prereqs defined
                const isUnlocked = checkPrerequisites(item.id, progress);
                const isCompleted = progress[item.id]?.status === 'completed';

                // Only look for prereqs if we have logic for it. 
                // Currently getPrerequisite is likely hardcoded for OSSU. 
                // We'll skip drawing specific prereq lines for others for now unless we update that util.
                const prereq = activeCurriculum === 'ossu' ? getPrerequisite(item.id) : null;

                nodes.push({
                    id: item.id,
                    x: layerX,
                    y: nodeY,
                    label: item.title,
                    section: item.sectionTitle,
                    type: 'neuron',
                    layer: layerIndex,
                    status: isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked'),
                    prereqId: prereq?.id
                });

                // Create edges (Synapses)
                if (prereq) {
                    edges.push({ source: prereq.id, target: item.id, type: 'synapse' });
                } else if (layerIndex > 0) {
                    // Visual flow connection: Connect to a node in the previous layer
                    // To avoid clutter, we can connect to the "center" node of the previous layer
                    // or just not draw these "implicit" edges.
                    // Let's draw a faint line to the previous layer's center to show flow
                    const prevLayerNodes = nodes.filter(n => n.layer === layerIndex - 1);
                    if (prevLayerNodes.length > 0) {
                        const sourceNode = prevLayerNodes[Math.floor(prevLayerNodes.length / 2)];
                        edges.push({ source: sourceNode.id, target: item.id, type: 'flow' });
                    }
                }
            });

            // Add Layer Label Node
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
    }, [progress, activeCurriculum]);

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

    // --- Keyboard Navigation ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            const PAN_STEP = 50;
            const ZOOM_STEP = 0.2;

            switch (e.key) {
                case 'ArrowUp':
                    setTransform(t => ({ ...t, y: t.y + PAN_STEP }));
                    break;
                case 'ArrowDown':
                    setTransform(t => ({ ...t, y: t.y - PAN_STEP }));
                    break;
                case 'ArrowLeft':
                    setTransform(t => ({ ...t, x: t.x + PAN_STEP }));
                    break;
                case 'ArrowRight':
                    setTransform(t => ({ ...t, x: t.x - PAN_STEP }));
                    break;
                case '+':
                case '=':
                    setTransform(t => ({ ...t, scale: Math.min(t.scale + ZOOM_STEP, 3) }));
                    break;
                case '-':
                    setTransform(t => ({ ...t, scale: Math.max(t.scale - ZOOM_STEP, 0.2) }));
                    break;
                case '0':
                    setTransform({ x: -200, y: -100, scale: 0.6 });
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[var(--bg-void)]">

            {/* Unified Control Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[var(--glass-surface)] backdrop-blur-xl border border-[var(--glass-border)] p-2 rounded-2xl shadow-2xl">

                {/* Curriculum Switcher */}
                <div className="flex bg-[var(--text-primary)]/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveCurriculum('ossu')}
                        title="OSSU Curriculum"
                        className={`p-2 rounded-lg transition-all ${activeCurriculum === 'ossu'
                            ? 'bg-[var(--text-primary)] text-[var(--bg-void)] shadow-lg'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Layers size={20} />
                    </button>
                    <button
                        onClick={() => setActiveCurriculum('roadmap')}
                        title="Roadmap.sh Curriculum"
                        className={`p-2 rounded-lg transition-all ${activeCurriculum === 'roadmap'
                            ? 'bg-[var(--text-primary)] text-[var(--bg-void)] shadow-lg'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Book size={20} />
                    </button>
                    <button
                        onClick={() => setActiveCurriculum('physics')}
                        title="Physics Curriculum"
                        className={`p-2 rounded-lg transition-all ${activeCurriculum === 'physics'
                            ? 'bg-[var(--text-primary)] text-[var(--bg-void)] shadow-lg'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Activity size={20} />
                    </button>
                </div>

                <div className="w-px h-8 bg-[var(--text-primary)]/10" />

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.2, 0.2) }))}
                        className="p-2 rounded-lg hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors"
                        title="Zoom Out (-)"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <span className="text-xs font-mono text-[var(--text-secondary)] w-12 text-center">
                        {Math.round(transform.scale * 100)}%
                    </span>
                    <button
                        onClick={() => setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.2, 3) }))}
                        className="p-2 rounded-lg hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors"
                        title="Zoom In (+)"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={() => setTransform({ x: -200, y: -100, scale: 0.6 })}
                        className="p-2 rounded-lg hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors ml-1"
                        title="Reset View (0)"
                    >
                        <Move size={20} />
                    </button>
                </div>
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
                    <svg width="3000" height="2000" className="overflow-visible">
                        <defs>
                            <filter id="neuron-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Edges (Synapses) */}
                        {edges.map((edge, i) => {
                            const source = nodes.find(n => n.id === edge.source);
                            const target = nodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;

                            const isHovered = hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id);
                            const isDimmed = hoveredNode && !isHovered;
                            const isFlow = edge.type === 'flow';

                            return (
                                <motion.path
                                    key={`${edge.source}-${edge.target}`}
                                    d={`M ${source.x} ${source.y} C ${source.x + 100} ${source.y}, ${target.x - 100} ${target.y}, ${target.x} ${target.y}`}
                                    stroke={isHovered ? "var(--accent-glow)" : "var(--text-primary)"}
                                    strokeWidth={isHovered ? 3 : (isFlow ? 0.5 : 1)}
                                    strokeOpacity={isHovered ? 0.8 : (isDimmed ? 0.05 : (isFlow ? 0.1 : 0.2))}
                                    fill="none"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: i * 0.005 }}
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
                                    transition={{ duration: 0.3, delay: node.layer * 0.1 + (i % 20) * 0.02 }}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/course/${node.id}`);
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
