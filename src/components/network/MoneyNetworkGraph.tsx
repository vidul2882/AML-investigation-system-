import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAML } from '../../context/AMLContext';
import { Account, Transaction, RiskLevel } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Filter,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatCompactINR, formatINR } from '../../utils/formatters';

interface NodePosition {
  id: string;
  x: number;
  y: number;
  account: Account;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  amount: number;
  transaction: Transaction;
  isHighlighted: boolean;
  hopNumber?: number;
}

interface MoneyNetworkGraphProps {
  onNodeClick?: (account: Account) => void;
  onEdgeClick?: (tx: Transaction) => void;
  heightClass?: string;
  compactMode?: boolean;
}

export const MoneyNetworkGraph: React.FC<MoneyNetworkGraphProps> = ({
  onNodeClick,
  onEdgeClick,
  heightClass = 'h-[620px]',
  compactMode = false,
}) => {
  const {
    accounts,
    transactions,
    highlightedPath,
    setHighlightedPath,
    setSelectedAccountId,
    setSelectedTransactionId,
  } = useAML();

  // Controls state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter transactions
  const visibleTransactions = useMemo(() => {
    let filtered = transactions;
    if (showSuspiciousOnly) {
      filtered = filtered.filter((t) => t.risk !== 'NORMAL');
    }
    return filtered;
  }, [transactions, showSuspiciousOnly]);

  // Accounts participating in visible transactions or explicitly in highlightedPath
  const visibleAccountIds = useMemo(() => {
    const ids = new Set<string>();
    visibleTransactions.forEach((tx) => {
      ids.add(tx.from);
      ids.add(tx.to);
    });
    highlightedPath.forEach((id) => ids.add(id));
    return ids;
  }, [visibleTransactions, highlightedPath]);

  // Layout positions: Smart initial structured layout
  const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>({});

  useEffect(() => {
    // Determine predefined sensible coordinates for demo networks
    // Centered layout with layered nodes in sequential flow
    const initialPos: { [id: string]: { x: number; y: number } } = {
      // Layering chain (A101 -> B205 -> C301 -> D410 -> E512)
      A101: { x: 120, y: 220 },
      B205: { x: 300, y: 150 },
      C301: { x: 500, y: 150 },
      D410: { x: 700, y: 220 },
      E512: { x: 900, y: 220 },

      // Circular ring (P100 -> Q200 -> R300 -> P100)
      P100: { x: 320, y: 440 },
      Q200: { x: 520, y: 410 },
      R300: { x: 420, y: 550 },

      // Rapid Movement (M101 -> M202 -> M303 -> M404)
      M101: { x: 680, y: 420 },
      M202: { x: 820, y: 390 },
      M303: { x: 950, y: 420 },
      M404: { x: 880, y: 550 },

      // Normal Utility & Retail Accounts
      N801: { x: 140, y: 420 },
      N802: { x: 120, y: 580 },
      N803: { x: 260, y: 620 },
      N804: { x: 580, y: 600 },
      N805: { x: 120, y: 720 },
      N806: { x: 740, y: 620 },
    };

    // Allocate any missing dynamically
    let dynamicIdx = 0;
    accounts.forEach((acc) => {
      if (!initialPos[acc.id]) {
        const col = dynamicIdx % 4;
        const row = Math.floor(dynamicIdx / 4);
        initialPos[acc.id] = {
          x: 250 + col * 200,
          y: 700 + row * 150,
        };
        dynamicIdx++;
      }
    });

    setPositions(initialPos);
  }, [accounts]);

  // Edges to render
  const edges: GraphEdge[] = useMemo(() => {
    return visibleTransactions.map((tx) => {
      // Check if edge is in highlighted path
      let isHighlighted = false;
      let hopNumber: number | undefined;

      for (let i = 0; i < highlightedPath.length - 1; i++) {
        if (highlightedPath[i] === tx.from && highlightedPath[i + 1] === tx.to) {
          isHighlighted = true;
          hopNumber = i + 1;
          break;
        }
      }

      return {
        id: tx.id,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        transaction: tx,
        isHighlighted,
        hopNumber,
      };
    });
  }, [visibleTransactions, highlightedPath]);

  // Nodes to render
  const nodes: NodePosition[] = useMemo(() => {
    return accounts
      .filter((a) => visibleAccountIds.has(a.id))
      .map((acc) => {
        const pos = positions[acc.id] || { x: 400, y: 300 };
        return {
          id: acc.id,
          x: pos.x,
          y: pos.y,
          account: acc,
        };
      });
  }, [accounts, visibleAccountIds, positions]);

  // Mouse Handlers for Pan & Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicked directly on canvas background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingNodeId) {
      // Update dragged node position in graph coordinates
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setPositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: Math.round(mouseX), y: Math.round(mouseY) },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.5));
  };

  const handleFitView = () => {
    setZoom(0.85);
    setPan({ x: 40, y: 20 });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHighlightedPath(['A101', 'B205', 'C301', 'D410', 'E512']);
  };

  const handleNodeSelect = (acc: Account) => {
    setSelectedAccountId(acc.id);
    if (onNodeClick) {
      onNodeClick(acc);
    }
  };

  const handleEdgeSelect = (tx: Transaction) => {
    setSelectedTransactionId(tx.id);
    if (onEdgeClick) {
      onEdgeClick(tx);
    }
  };

  // Search node focus
  const handleSearchNode = (nodeId: string) => {
    const target = positions[nodeId.toUpperCase().trim()];
    if (target) {
      setZoom(1.2);
      setPan({
        x: 400 - target.x * 1.2,
        y: 280 - target.y * 1.2,
      });
      setSelectedAccountId(nodeId.toUpperCase().trim());
    }
  };

  // Node Color Mapper
  const getNodeColor = (risk: RiskLevel, isHighlighted: boolean) => {
    if (isHighlighted) {
      return {
        fill: '#fff1f2',
        stroke: '#e11d48',
        badge: '#be123c',
        glow: 'rgba(225, 29, 72, 0.4)',
      };
    }
    switch (risk) {
      case 'CRITICAL':
        return {
          fill: '#fff1f2',
          stroke: '#e11d48',
          badge: '#be123c',
          glow: 'rgba(225, 29, 72, 0.25)',
        };
      case 'HIGH_RISK':
        return {
          fill: '#fef2f2',
          stroke: '#ef4444',
          badge: '#b91c1c',
          glow: 'rgba(239, 68, 68, 0.2)',
        };
      case 'SUSPICIOUS':
        return {
          fill: '#fffbeb',
          stroke: '#f59e0b',
          badge: '#b45309',
          glow: 'rgba(245, 158, 11, 0.2)',
        };
      case 'NORMAL':
      default:
        return {
          fill: '#f0fdf4',
          stroke: '#10b981',
          badge: '#047857',
          glow: 'rgba(16, 185, 129, 0.1)',
        };
    }
  };

  return (
    <div
      ref={containerRef}
      id="money-network-graph-container"
      className={`relative w-full ${heightClass} bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden select-none`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Find Account (e.g. A101)..."
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                if (e.target.value.length >= 3) {
                  handleSearchNode(e.target.value);
                }
              }}
              className="w-36 text-xs bg-transparent border-none outline-none font-mono text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            id="toggle-suspicious-only-btn"
            onClick={() => setShowSuspiciousOnly(!showSuspiciousOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              showSuspiciousOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Toggle between All Transactions and Suspicious Flows only"
          >
            {showSuspiciousOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSuspiciousOnly ? 'Suspicious Only' : 'All Transactions'}</span>
          </button>
        </div>

        {/* Right: Zoom & Reset Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitView}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Fit to View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Reset Graph"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        id="money-network-svg"
        className="w-full h-full cursor-grab active:cursor-grabbing bg-radial from-slate-50 to-slate-100/80"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Directed Arrow Markers */}
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-suspicious"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-critical"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#e11d48" />
          </marker>
          <marker
            id="arrow-highlighted"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
          </marker>

          {/* Grid pattern */}
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 4" />
          </pattern>

          {/* Filter glow */}
          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect id="graph-bg" width="100%" height="100%" fill="url(#graph-grid)" />

        {/* Transformable Canvas Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Edges */}
          {edges.map((edge) => {
            const source = positions[edge.from];
            const target = positions[edge.to];
            if (!source || !target) return null;

            // Curve offset if bidirectional
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            // Arrow marker & color
            let strokeColor = '#94a3b8';
            let strokeWidth = 1.8;
            let marker = 'url(#arrow-normal)';

            if (edge.isHighlighted) {
              strokeColor = '#e11d48';
              strokeWidth = 3.5;
              marker = 'url(#arrow-highlighted)';
            } else if (edge.transaction.risk === 'CRITICAL') {
              strokeColor = '#e11d48';
              strokeWidth = 2.8;
              marker = 'url(#arrow-critical)';
            } else if (edge.transaction.risk === 'HIGH_RISK') {
              strokeColor = '#f43f5e';
              strokeWidth = 2.4;
              marker = 'url(#arrow-critical)';
            } else if (edge.transaction.risk === 'SUSPICIOUS') {
              strokeColor = '#f59e0b';
              strokeWidth = 2.2;
              marker = 'url(#arrow-suspicious)';
            } else {
              strokeColor = '#10b981';
              strokeWidth = 1.6;
              marker = 'url(#arrow-normal)';
            }

            return (
              <g
                key={edge.id}
                className="cursor-pointer group"
                onClick={() => handleEdgeSelect(edge.transaction)}
              >
                {/* Edge line */}
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.isHighlighted ? '6 3' : undefined}
                  markerEnd={marker}
                  className={edge.isHighlighted ? 'animate-pulse' : 'transition-all'}
                />

                {/* Edge Label Pill with Amount */}
                <g transform={`translate(${midX}, ${midY - 12})`}>
                  <rect
                    x="-42"
                    y="-11"
                    width="84"
                    height="20"
                    rx="10"
                    fill={edge.isHighlighted ? '#881337' : '#ffffff'}
                    stroke={edge.isHighlighted ? '#fda4af' : '#cbd5e1'}
                    strokeWidth="1.2"
                    className="shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <text
                    textAnchor="middle"
                    y="3"
                    className={`font-mono text-[10px] font-bold ${
                      edge.isHighlighted ? 'fill-white' : 'fill-slate-800'
                    }`}
                  >
                    {formatCompactINR(edge.amount)}
                  </text>
                  {edge.hopNumber && (
                    <g transform="translate(-46, -11)">
                      <circle r="7" cx="0" cy="0" fill="#e11d48" />
                      <text
                        textAnchor="middle"
                        y="2.5"
                        className="fill-white text-[8px] font-extrabold"
                      >
                        {edge.hopNumber}
                      </text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isHighlighted = highlightedPath.includes(node.id);
            const color = getNodeColor(node.account.risk, isHighlighted);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingNodeId(node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeSelect(node.account);
                }}
              >
                {/* Node Outer Glow if Highlighted or Critical */}
                {(isHighlighted || node.account.risk === 'CRITICAL') && (
                  <circle
                    r="36"
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth="4"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Node Card Circle / Box */}
                <rect
                  x="-32"
                  y="-32"
                  width="64"
                  height="64"
                  rx="16"
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={isHighlighted ? '3' : '2'}
                  filter={isHighlighted ? 'url(#glow-filter)' : undefined}
                  className="transition-all duration-200 group-hover:scale-105 shadow-md"
                />

                {/* Account ID */}
                <text
                  textAnchor="middle"
                  y="-6"
                  className="font-mono font-extrabold text-xs fill-slate-900 tracking-tight"
                >
                  {node.id}
                </text>

                {/* Risk Badge on Node */}
                <rect
                  x="-26"
                  y="4"
                  width="52"
                  height="14"
                  rx="7"
                  fill={color.stroke}
                />
                <text
                  textAnchor="middle"
                  y="14"
                  className="text-[8px] font-bold fill-white uppercase tracking-wider"
                >
                  {node.account.risk === 'CRITICAL'
                    ? 'CRIT'
                    : node.account.risk === 'HIGH_RISK'
                    ? 'HIGH'
                    : node.account.risk === 'SUSPICIOUS'
                    ? 'SUSP'
                    : 'NORM'}
                </text>

                {/* Node Subtitle Name Tooltip */}
                <g transform="translate(0, 44)">
                  <rect
                    x="-60"
                    y="0"
                    width="120"
                    height="18"
                    rx="9"
                    fill="#1e293b"
                    opacity="0.9"
                  />
                  <text
                    textAnchor="middle"
                    y="12"
                    className="text-[9px] fill-white font-medium truncate"
                  >
                    {node.account.name ? node.account.name.substring(0, 18) : node.account.type}
                  </text>
                </g>

                {/* Inflow / Outflow Micro-Tags */}
                <g transform="translate(0, 68)">
                  <text
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-500 font-semibold"
                  >
                    Out: {formatCompactINR(node.account.totalOutflow)}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md text-xs text-slate-700 pointer-events-auto">
        <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
          Legend:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px]">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-[11px]">Suspicious</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-[11px]">High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200" />
          <span className="text-[11px] font-bold text-rose-700">Critical</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Click node for intelligence • Drag nodes to arrange</span>
        </div>
      </div>
    </div>
  );
};
