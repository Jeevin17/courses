declare module 'dagre' {
    export namespace graphlib {
        class Graph {
            constructor(options?: any);
            setDefaultEdgeLabel(label: any): void;
            setGraph(options: any): void;
            setNode(id: string, node: any): void;
            setEdge(source: string, target: string, options?: any): void;
            node(id: string): any;
            nodes(): string[];
            edges(): any[];
        }
    }
    export function layout(graph: any): void;
}
