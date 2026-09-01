import { useEffect, useState, useMemo } from 'react';
import api from './lib/api';
import { X } from 'lucide-react';
import { cn } from './lib/utils';

interface GraphData {
  nodes: { id: string; name: string; type: 'domain' | 'expert'; val: number }[];
  links: { source: string; target: string }[];
}

export default function KnowledgeGraph() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await api.get('/knowledge/graph');
        setData(res.data || { nodes: [], links: [] });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const width = 600;
  const height = 400;
  
  const nodesWithPos = useMemo(() => {
    if (!data.nodes || data.nodes.length === 0) return [];
    return data.nodes.map((node, i) => {
        const angle = (i / data.nodes.length) * 2 * Math.PI;
        const radius = node.type === 'domain' ? 60 : 140;
        return {
            ...node,
            x: width / 2 + radius * Math.cos(angle),
            y: height / 2 + radius * Math.sin(angle),
        };
    });
  }, [data.nodes]);

  const posMap = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    nodesWithPos.forEach(node => { map[node.id] = { x: node.x, y: node.y }; });
    return map;
  }, [nodesWithPos]);

  const selectedNode = nodesWithPos.find(n => n.id === selectedNodeId);

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading Knowledge Graph...</div>;
  if (data.nodes.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500">No graph data available.</div>;

  return (
    <div className="relative w-full h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex h-full">
        <div className="flex-1 relative">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            {data.links?.map((link, i) => {
              const source = posMap[link.source];
              const target = posMap[link.target];
              if (!source || !target) return null;
              return (
                <line
                  key={i}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
              );
            })}
            {nodesWithPos.map((node) => (
              <g 
                key={node.id} 
                transform={`translate(${node.x},${node.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer"
              >
                <circle
                  r={node.type === 'domain' ? (selectedNodeId === node.id ? 24 : 20) : (selectedNodeId === node.id ? 15 : 11)}
                  fill={node.type === 'domain' ? '#4f46e5' : '#10b981'}
                  className={cn(
                    "transition-all duration-200 hover:opacity-80",
                    selectedNodeId === node.id ? "stroke-2 stroke-indigo-300 dark:stroke-indigo-500" : ""
                  )}
                />
                <text
                  dy={node.type === 'domain' ? 35 : 25}
                  textAnchor="middle"
                  className={cn(
                    "text-[10px] pointer-events-none select-none font-medium",
                    selectedNodeId === node.id ? "fill-indigo-600 dark:fill-indigo-400 font-bold" : "fill-gray-600 dark:fill-gray-300"
                  )}
                >
                  {node.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {selectedNode && (
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white truncate pr-2">{selectedNode.name}</h4>
              <button onClick={() => setSelectedNodeId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Type</p>
                <span className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset mt-1",
                  selectedNode.type === 'domain' ? "bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-400" : "bg-green-50 text-green-700 ring-green-700/10 dark:bg-green-950/40 dark:text-green-400"
                )}>
                  {selectedNode.type === 'domain' ? 'Knowledge Domain' : 'Subject Expert'}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Node Weight</p>
                <p className="text-sm text-gray-900 dark:text-gray-300 mt-1">{Number(selectedNode.val || 1).toFixed(2)}</p>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                 <p className="text-xs text-gray-500 dark:text-gray-400 italic">Institutional anchor in the RAI governance graph.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
