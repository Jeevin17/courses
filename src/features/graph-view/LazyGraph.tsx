import { useCallback, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    useReactFlow,
    ReactFlowProvider,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as dagre from 'dagre';
import { useNavigate } from 'react-router-dom';
import RoadmapNode from './RoadmapNode';

const nodeTypes = {
    roadmap: RoadmapNode,
};

// --- Layout Helper ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 100;

    dagreGraph.setGraph({ rankdir: direction, ranksep: 200, nodesep: 150 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        // @ts-ignore
        node.targetPosition = direction === 'LR' ? 'left' : 'top';
        // @ts-ignore
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

interface LazyGraphProps {
    items: any[]; // Processed items with status
    activeCurriculum: string;
    onNodeSelect?: (nodeId: string) => void;
}

const GraphContent = ({ items, activeCurriculum, onNodeSelect }: LazyGraphProps) => {
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    // ... (useEffect remains same) ...

    useEffect(() => {
        const rawNodes: Node[] = [];
        const rawEdges: Edge[] = [];

        items.forEach(item => {
            rawNodes.push({
                id: item.id,
                type: 'roadmap',
                data: {
                    label: item.title,
                    status: item.status,
                    section: item.sectionTitle,
                    subtopics: item.subtopics || []
                },
                position: { x: 0, y: 0 }
            });

            // Handle prerequisites
            const prereqIds = item.prerequisites || [];
            // Wait, items passed here are flat. We need to know connections.
            // The original code used 'filteredItems' to check if prereq exists in current view.

            prereqIds.forEach((prereqId: string) => {
                if (items.find(i => i.id === prereqId)) {
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

        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 100);

    }, [items, activeCurriculum, setNodes, setEdges, fitView]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (onNodeSelect) {
            onNodeSelect(node.id);
            return;
        }

        if (node.data.subtopics && node.data.subtopics.length > 0) {
            const isExpanded = nodes.some(n => n.id.startsWith(`${node.id}-sub-`));

            if (isExpanded) {
                setNodes(nds => nds.filter(n => !n.id.startsWith(`${node.id}-sub-`)));
                setEdges(eds => eds.filter(e => !e.source.startsWith(`${node.id}-sub-`) && !e.target.startsWith(`${node.id}-sub-`)));
            } else {
                const subNodes = node.data.subtopics.map((sub: any, index: number) => {
                    const subId = `${node.id}-sub-${index}`;
                    return {
                        id: subId,
                        type: 'roadmap',
                        data: { label: typeof sub === 'string' ? sub : sub.title, status: 'unlocked' },
                        position: {
                            x: node.position.x + (index % 2 === 0 ? -150 : 150),
                            y: node.position.y + 120 + (Math.floor(index / 2) * 100)
                        },
                        parentNode: undefined,
                    };
                });

                const subEdges = subNodes.map((subNode: any) => ({
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
            navigate(`/course/${node.id}`);
        }
    }, [nodes, navigate, setNodes, setEdges, onNodeSelect]);

    return (
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
    );
};

export default function LazyGraph(props: LazyGraphProps) {
    return (
        <ReactFlowProvider>
            <GraphContent {...props} />
        </ReactFlowProvider>
    );
}
