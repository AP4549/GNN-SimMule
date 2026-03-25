import { useRef, useEffect, useCallback, useState } from 'react';
import { SCENARIOS, TYPE_COLORS, CH_COLORS, getRiskColor, fmtINR } from '@/data/scenarios';
import type { ScenarioNode, ScenarioEdge } from '@/data/scenarios';
import { generateMessages, aggregateMessages, updateRisk, AggregationType, GNNMessage } from '@/lib/gnnEngine';

interface NodeState extends ScenarioNode {
  currentRisk: number;
  displayRisk: number;
}

interface Particle {
  sx: number; sy: number; ex: number; ey: number;
  progress: number; value: number; color: string;
}

const NODE_R = 32;
const BASE_DUR = 1200;

function easeIO(t: number) { return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export interface AnalysisData {
  sorted: NodeState[];
  topSuspect: NodeState;
  focusNode: NodeState | undefined;
  drivers: { srcNode: NodeState | undefined; edge: ScenarioEdge; contrib: number }[];
  riskHistory: Record<string, number[]>;
  layer: number;
  focusNodeId: string;
}

interface GraphVisualizerProps {
  scenario: string;
  onAnalysis?: (data: AnalysisData | null) => void;
}

export default function GraphVisualizer({ scenario, onAnalysis }: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    nodes: [] as NodeState[],
    edges: [] as ScenarioEdge[],
    messages: [] as GNNMessage[],
    particles: [] as Particle[],
    phase: 'IDLE' as string,
    layer: 0,
    weight: 0.7,
    aggregation: 'SUM' as AggregationType,
    speedMultiplier: 1.0,
    animating: false,
    phaseProgress: 0,
    phaseStartTime: null as number | null,
    phaseDuration: BASE_DUR,
    hoverNode: null as string | null,
    hoverEdge: null as number | null,
    aggregatedMsgs: {} as Record<string, number>,
    nodeAnimData: {} as Record<string, { oldRisk: number; newRisk: number; delta: number }>,
    riskHistory: {} as Record<string, number[]>,
    autoPlaying: false,
    autoTimer: null as ReturnType<typeof setTimeout> | null,
  });

  const [phase, setPhase] = useState('IDLE');
  const [layer, setLayer] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [weight, setWeight] = useState(0.7);
  const [aggregation, setAggregation] = useState<AggregationType>('SUM');
  const [stats, setStats] = useState({ nodes: 0, edges: 0, avgRisk: 0 });
  const [tooltip, setTooltip] = useState<{ html: string; x: number; y: number } | null>(null);

  const updateStats = useCallback(() => {
    const s = stateRef.current;
    const avg = s.nodes.reduce((sum, n) => sum + n.currentRisk, 0) / (s.nodes.length || 1);
    setStats({ nodes: s.nodes.length, edges: s.edges.length, avgRisk: avg });
    setPhase(s.phase);
    setLayer(s.layer);
    setIsAnimating(s.animating);
    setIsAutoPlaying(s.autoPlaying);
  }, []);

  const loadScenario = useCallback((key: string) => {
    const sc = SCENARIOS[key];
    if (!sc) return;
    const s = stateRef.current;
    s.nodes = sc.nodes.map(n => ({ ...n, currentRisk: n.risk, displayRisk: n.risk }));
    s.edges = sc.edges.map(e => ({ ...e }));
    s.messages = []; s.particles = [];
    s.phase = 'IDLE'; s.layer = 0;
    s.animating = false; s.phaseProgress = 0; s.phaseStartTime = null;
    s.aggregatedMsgs = {}; s.nodeAnimData = {};
    s.riskHistory = {};
    s.autoPlaying = false;
    if (s.autoTimer) { clearTimeout(s.autoTimer); s.autoTimer = null; }
    for (const n of s.nodes) s.riskHistory[n.id] = [n.risk];
    updateStats();
    onAnalysis?.(null);
  }, [updateStats, onAnalysis]);

  useEffect(() => { loadScenario(scenario); }, [scenario, loadScenario]);

  // Canvas resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const cont = containerRef.current;
      if (!canvas || !cont) return;
      canvas.width = cont.clientWidth;
      canvas.height = cont.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getTransform = useCallback(() => {
    const sc = SCENARIOS[scenario];
    if (!sc) return { minX: 0, minY: 0, scale: 1, ox: 0, oy: 0 };
    const canvas = canvasRef.current;
    if (!canvas) return { minX: 0, minY: 0, scale: 1, ox: 0, oy: 0 };
    const ns = sc.nodes;
    const pad = 80;
    const minX = Math.min(...ns.map(n => n.x));
    const maxX = Math.max(...ns.map(n => n.x));
    const minY = Math.min(...ns.map(n => n.y));
    const maxY = Math.max(...ns.map(n => n.y));
    const sw = (maxX - minX) || 1;
    const sh = (maxY - minY) || 1;
    const dw = canvas.width - 2 * pad;
    const dh = canvas.height - 2 * pad;
    const scale = Math.min(dw / sw, dh / sh, 1.6);
    const ox = (canvas.width - sw * scale) / 2;
    const oy = (canvas.height - sh * scale) / 2;
    return { minX, minY, scale, ox, oy };
  }, [scenario]);

  const toCanvas = useCallback((sx: number, sy: number, t: ReturnType<typeof getTransform>) => {
    return { x: (sx - t.minX) * t.scale + t.ox, y: (sy - t.minY) * t.scale + t.oy };
  }, []);

  // Phase logic
  const doGenerate = useCallback(() => {
    const s = stateRef.current;
    const sc = SCENARIOS[scenario];
    s.messages = generateMessages(s.nodes, s.edges, s.weight);
    s.particles = [];
    s.messages.forEach((msg) => {
      const srcNode = s.nodes.find(n => n.id === msg.source);
      const tgtNode = s.nodes.find(n => n.id === msg.target);
      if (!srcNode || !tgtNode) return;

      const srcScene = sc.nodes.find(n => n.id === msg.source)!;
      const tgtScene = sc.nodes.find(n => n.id === msg.target)!;
      s.particles.push({
        sx: srcScene.x, sy: srcScene.y, ex: tgtScene.x, ey: tgtScene.y,
        progress: 0, value: msg.value,
        color: msg.value >= 5 ? '#ff0070' : msg.value >= 3 ? '#7000ff' : '#00f2ff'
      });
    });
  }, [scenario]);

  const doAggregate = useCallback(() => {
    const s = stateRef.current;
    s.aggregatedMsgs = {};
    for (const node of s.nodes) {
      s.aggregatedMsgs[node.id] = aggregateMessages(node.id, s.messages, s.aggregation);
    }
  }, []);

  const doUpdateSetup = useCallback(() => {
    const s = stateRef.current;
    s.nodeAnimData = {};
    for (const node of s.nodes) {
      const agg = s.aggregatedMsgs[node.id] || 0;
      const nr = updateRisk(node.currentRisk, agg);
      s.nodeAnimData[node.id] = { oldRisk: node.currentRisk, newRisk: nr, delta: nr - node.currentRisk };
    }
  }, []);

  const doAnalyze = useCallback(() => {
    const s = stateRef.current;
    const sc = SCENARIOS[scenario];
    for (const node of s.nodes) {
      if (s.nodeAnimData[node.id]) {
        node.currentRisk = s.nodeAnimData[node.id].newRisk;
        node.displayRisk = node.currentRisk;
      }
      s.riskHistory[node.id].push(node.currentRisk);
    }
    s.layer++;
    const sorted = [...s.nodes].sort((a, b) => b.currentRisk - a.currentRisk);
    const topSuspect = sorted[0];
    const focusNode = s.nodes.find(n => n.id === sc.focusNode);
    const inEdges = s.edges.filter(e => e.target === sc.focusNode);
    const drivers = inEdges.map(edge => {
      const src = s.nodes.find(n => n.id === edge.source);
      const contrib = (src ? src.currentRisk : 0) * edge.multiplier * s.weight;
      return { srcNode: src, edge, contrib };
    }).sort((a, b) => b.contrib - a.contrib).slice(0, 3);
    s.animating = false;
    onAnalysis?.({ sorted, topSuspect, focusNode, drivers, riskHistory: { ...s.riskHistory }, layer: s.layer, focusNodeId: sc.focusNode });
    updateStats();
  }, [scenario, updateStats, onAnalysis]);

  const startPhase = useCallback((p: string) => {
    const s = stateRef.current;
    s.phase = p; s.phaseProgress = 0; s.phaseStartTime = null;
    s.phaseDuration = BASE_DUR / s.speedMultiplier;
    if (p === 'GENERATE') { s.animating = true; doGenerate(); }
    else if (p === 'AGGREGATE') { s.animating = true; doAggregate(); }
    else if (p === 'UPDATE') { s.animating = true; doUpdateSetup(); }
    else if (p === 'ANALYZE') { s.animating = false; doAnalyze(); }
    updateStats();
  }, [doGenerate, doAggregate, doUpdateSetup, doAnalyze, updateStats]);

  const getNextPhase = useCallback(() => {
    const map: Record<string, string> = { IDLE: 'GENERATE', GENERATE: 'AGGREGATE', AGGREGATE: 'UPDATE', UPDATE: 'ANALYZE', ANALYZE: 'GENERATE' };
    return map[stateRef.current.phase] || 'GENERATE';
  }, []);

  const runNextPhase = useCallback(() => {
    if (stateRef.current.animating) return;
    startPhase(getNextPhase());
  }, [startPhase, getNextPhase]);

  const toggleAutoPlay = useCallback(() => {
    const s = stateRef.current;
    if (s.autoPlaying) {
      s.autoPlaying = false;
      if (s.autoTimer) { clearTimeout(s.autoTimer); s.autoTimer = null; }
      updateStats();
      return;
    }
    s.autoPlaying = true;
    updateStats();
    const doAutoStep = () => {
      if (!s.autoPlaying) return;
      if (s.animating) { s.autoTimer = setTimeout(doAutoStep, 150); return; }
      if (s.phase === 'ANALYZE') {
        s.autoTimer = setTimeout(() => {
          if (!s.autoPlaying) return;
          startPhase('GENERATE');
          s.autoTimer = setTimeout(doAutoStep, s.phaseDuration + 400);
        }, Math.max(600, 1400 / s.speedMultiplier));
        return;
      }
      const next = getNextPhase();
      startPhase(next);
      s.autoTimer = setTimeout(doAutoStep, s.phaseDuration + (next === 'UPDATE' ? 600 : 350));
    };
    doAutoStep();
  }, [startPhase, getNextPhase, updateStats]);

  const handleReset = useCallback(() => {
    const s = stateRef.current;
    s.autoPlaying = false;
    if (s.autoTimer) { clearTimeout(s.autoTimer); s.autoTimer = null; }
    loadScenario(scenario);
  }, [scenario, loadScenario]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const drawEdge = (sp: {x:number,y:number}, tp: {x:number,y:number}, edge: ScenarioEdge, hovered: boolean) => {
      const col = CH_COLORS[edge.channel] || '#64748b';
      const dx = tp.x - sp.x, dy = tp.y - sp.y;
      const len = Math.sqrt(dx * dx + dy * dy); if (!len) return;
      const ux = dx / len, uy = dy / len;
      // Tighten the line to the nodes (smaller offset than NODE_R so it touches)
      const sx = sp.x + ux * (NODE_R - 5), sy = sp.y + uy * (NODE_R - 5);
      const ex = tp.x - ux * (NODE_R - 5), ey = tp.y - uy * (NODE_R - 5);
      
      const isDashed = edge.multiplier >= 2.0;
      if (isDashed) {
        ctx.setLineDash([6, 4]);
      }

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey); // Straight lines according to image style
      ctx.strokeStyle = col;
      ctx.lineWidth = hovered ? 4 : 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Add glow only if multiplier is high
      if (edge.multiplier >= 2.0) {
        ctx.shadowColor = col;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    const drawNode = (x: number, y: number, node: NodeState, hovered: boolean, focused: boolean) => {
      const risk = node.displayRisk !== undefined ? node.displayRisk : node.currentRisk;
      const themeColor = risk >= 8.0 ? '#ff0070' : risk >= 5.0 ? '#7000ff' : '#00f2ff';
      const secondaryColor = risk >= 8.0 ? '#ff4090' : risk >= 5.0 ? '#9040ff' : '#40ffff';
      
      // 1. External Glow (Aura)
      if (risk >= 5.0 || hovered || focused) {
        ctx.beginPath();
        ctx.arc(x, y, NODE_R + 10, 0, Math.PI * 2);
        const aura = ctx.createRadialGradient(x, y, NODE_R, x, y, NODE_R + 15);
        aura.addColorStop(0, `${themeColor}${hovered ? '25' : '15'}`);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.fill();
      }

      // 2. Scanline effect for high risk
      if (risk >= 8.0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
        ctx.clip();
        const scanY = (Date.now() / 20 % (NODE_R * 2)) - NODE_R;
        ctx.beginPath();
        ctx.moveTo(x - NODE_R, y + scanY);
        ctx.lineTo(x + NODE_R, y + scanY);
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Primary Ring
      ctx.beginPath();
      ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
      ctx.lineWidth = focused ? 3 : 2;
      ctx.strokeStyle = focused ? '#ffffff' : themeColor;
      ctx.stroke();
      
      // Subtle Inner Glow
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // 4. Focal Inner Shield
      ctx.beginPath();
      ctx.arc(x, y, NODE_R - 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.8)'; 
      ctx.fill();

      // 5. Identity Badge
      const badgeR = 10;
      const bx = x - NODE_R * 0.7;
      const by = y - NODE_R * 0.7;
      
      ctx.beginPath();
      ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = themeColor;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id.substring(0, 1).toUpperCase(), bx, by);

      // 6. Central Metric (The Score)
      ctx.fillStyle = focused ? '#ffffff' : themeColor;
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(risk.toFixed(1), x, y + 2);

      // 7. Small Label underneath
      if (hovered || focused) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.toUpperCase(), x, y + NODE_R + 14);
      }
    };

    const render = (ts: number) => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!s.nodes.length) { animId = requestAnimationFrame(render); return; }

      // Tick animations
      if (s.animating) {
        if (!s.phaseStartTime) s.phaseStartTime = ts;
        s.phaseProgress = Math.min(1, (ts - s.phaseStartTime) / s.phaseDuration);
        const p = easeIO(s.phaseProgress);
        if (s.phase === 'GENERATE') {
          for (const pt of s.particles) pt.progress = p;
          if (s.phaseProgress >= 1) { s.animating = false; s.particles = []; updateStats(); }
        } else if (s.phase === 'AGGREGATE') {
          if (s.phaseProgress >= 1) { s.animating = false; updateStats(); }
        } else if (s.phase === 'UPDATE') {
          for (const node of s.nodes) {
            const ad = s.nodeAnimData[node.id];
            if (ad) node.displayRisk = lerp(ad.oldRisk, ad.newRisk, p);
          }
          if (s.phaseProgress >= 1) { s.animating = false; startPhase('ANALYZE'); }
        }
      }

      const t = getTransform();
      const sc = SCENARIOS[scenario];
      if (!sc) { animId = requestAnimationFrame(render); return; }
      const cpos: Record<string, { x: number; y: number }> = {};
      for (const n of sc.nodes) cpos[n.id] = toCanvas(n.x, n.y, t);

      // Dimming
      const dimNodes = new Set<string>(), dimEdges = new Set<number>();
      if (s.hoverNode) {
        const connected = new Set([s.hoverNode]);
        s.edges.forEach(e => { if (e.source === s.hoverNode || e.target === s.hoverNode) { connected.add(e.source); connected.add(e.target); } });
        s.nodes.forEach(n => { if (!connected.has(n.id)) dimNodes.add(n.id); });
        s.edges.forEach((e, i) => { if (e.source !== s.hoverNode && e.target !== s.hoverNode) dimEdges.add(i); });
      }
      if (s.hoverEdge !== null) {
        const he = s.edges[s.hoverEdge];
        s.nodes.forEach(n => { if (n.id !== he.source && n.id !== he.target) dimNodes.add(n.id); });
        s.edges.forEach((_, i) => { if (i !== s.hoverEdge) dimEdges.add(i); });
      }

      // Draw edges
      s.edges.forEach((edge, i) => {
        const sp = cpos[edge.source], tp = cpos[edge.target];
        if (!sp || !tp) return;
        ctx.globalAlpha = dimEdges.has(i) ? 0.15 : 1;
        drawEdge(sp, tp, edge, s.hoverEdge === i);
      });
      ctx.globalAlpha = 1;

      // Particles
      if (s.phase === 'GENERATE') {
        for (const pt of s.particles) {
          const cpx = lerp((pt.sx - t.minX) * t.scale + t.ox, (pt.ex - t.minX) * t.scale + t.ox, pt.progress);
          const cpy = lerp((pt.sy - t.minY) * t.scale + t.oy, (pt.ey - t.minY) * t.scale + t.oy, pt.progress);
          ctx.globalAlpha = 0.95;
          ctx.beginPath(); ctx.arc(cpx, cpy, 6, 0, Math.PI * 2);
          ctx.fillStyle = pt.color; ctx.fill();
          ctx.shadowColor = pt.color; ctx.shadowBlur = 12;
          ctx.fill(); ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(pt.value.toFixed(1), cpx, cpy);
          ctx.textBaseline = 'alphabetic';
        }
        ctx.globalAlpha = 1;
      }

      // Aggregate labels
      if (s.phase === 'AGGREGATE') {
        for (const node of s.nodes) {
          const p = cpos[node.id]; if (!p) continue;
          const agg = s.aggregatedMsgs[node.id];
          if (!agg) continue;
          ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(`+${agg.toFixed(2)}`, p.x, p.y - NODE_R - 8);
        }
      }

      // Update deltas
      if (s.phase === 'UPDATE') {
        for (const node of s.nodes) {
          const p = cpos[node.id]; if (!p) continue;
          const ad = s.nodeAnimData[node.id];
          if (!ad || ad.delta <= 0.001) continue;
          ctx.globalAlpha = Math.min(1, s.phaseProgress * 2.5);
          ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(`+${ad.delta.toFixed(2)}`, p.x, p.y - NODE_R - 14);
          ctx.globalAlpha = 1;
        }
      }

      // Draw nodes
      const focusId = sc.focusNode;
      s.nodes.forEach(node => {
        const p = cpos[node.id]; if (!p) return;
        ctx.globalAlpha = dimNodes.has(node.id) ? 0.15 : 1;
        drawNode(p.x, p.y, node, s.hoverNode === node.id, node.id === focusId);
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [scenario, getTransform, toCanvas, updateStats, startPhase]);

  // Mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hitTest = (mx: number, my: number) => {
      const t = getTransform();
      const sc = SCENARIOS[scenario];
      if (!sc) return { type: 'none' as const };
      const cpos: Record<string, { x: number; y: number }> = {};
      for (const n of sc.nodes) cpos[n.id] = toCanvas(n.x, n.y, t);
      const s = stateRef.current;
      for (const node of s.nodes) {
        const p = cpos[node.id]; if (!p) continue;
        if (Math.hypot(mx - p.x, my - p.y) <= NODE_R + 6) return { type: 'node' as const, id: node.id };
      }
      for (let i = 0; i < s.edges.length; i++) {
        const e = s.edges[i];
        const sp = cpos[e.source], tp = cpos[e.target];
        if (!sp || !tp) continue;
        const dx = tp.x - sp.x, dy = tp.y - sp.y, l2 = dx * dx + dy * dy;
        if (!l2) continue;
        const tt = Math.max(0, Math.min(1, ((mx - sp.x) * dx + (my - sp.y) * dy) / l2));
        if (Math.hypot(mx - sp.x - tt * dx, my - sp.y - tt * dy) <= 9) return { type: 'edge' as const, idx: i };
      }
      return { type: 'none' as const };
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const hit = hitTest(mx, my);
      const s = stateRef.current;
      s.hoverNode = null; s.hoverEdge = null;

      if (hit.type === 'node') {
        s.hoverNode = hit.id;
        const node = s.nodes.find(n => n.id === hit.id);
        if (node) {
          const nbrs = new Set<string>();
          s.edges.forEach(edge => { if (edge.source === hit.id) nbrs.add(edge.target); if (edge.target === hit.id) nbrs.add(edge.source); });
          const rc = node.currentRisk >= 6 ? '#fca5a5' : node.currentRisk >= 3 ? '#fcd34d' : '#86efac';
          setTooltip({
            html: `<div style="font-weight:700;margin-bottom:6px;">${node.label} <span style="opacity:0.5;font-size:11px;">— ${node.type}</span></div>
              <div style="display:flex;flex-direction:column;gap:2px;font-size:11px;">
                <div>Risk: <span style="color:${rc};font-weight:700;">${node.currentRisk.toFixed(1)}</span> / 10</div>
                <div>Flow: ${node.flow} · Velocity: ${node.velocity}</div>
                <div>Neighbors: ${nbrs.size}</div>
              </div>`,
            x: e.clientX, y: e.clientY
          });
        }
      } else if (hit.type === 'edge') {
        s.hoverEdge = hit.idx;
        const edge = s.edges[hit.idx];
        const cc = CH_COLORS[edge.channel] || '#94a3b8';
        setTooltip({
          html: `<div style="font-weight:700;margin-bottom:6px;">${edge.source} → ${edge.target}</div>
            <div style="display:flex;flex-direction:column;gap:2px;font-size:11px;">
              <div><span style="color:${cc};">${edge.channel}</span> · ${fmtINR(edge.amount)}</div>
              <div>Speed: ${edge.speed} · Shared IP: ${edge.sharedIP ? '⚠ Yes' : 'No'}</div>
              <div>Multiplier: ${edge.multiplier.toFixed(1)}x</div>
            </div>`,
          x: e.clientX, y: e.clientY
        });
      } else {
        setTooltip(null);
      }
    };

    const onLeave = () => {
      stateRef.current.hoverNode = null;
      stateRef.current.hoverEdge = null;
      setTooltip(null);
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [scenario, getTransform, toCanvas]);

  // Sync controls to ref
  useEffect(() => { stateRef.current.weight = weight; }, [weight]);
  useEffect(() => { stateRef.current.aggregation = aggregation; }, [aggregation]);

  const phaseLabel: Record<string, string> = {
    IDLE: 'Ready',
    GENERATE: 'Generating messages…',
    AGGREGATE: 'Aggregating signals…',
    UPDATE: 'Updating risk scores…',
    ANALYZE: 'Analysis complete →'
  };

  const phaseClass: Record<string, string> = {
    IDLE: 'phase-idle',
    GENERATE: 'phase-generate',
    AGGREGATE: 'phase-aggregate',
    UPDATE: 'phase-update',
    ANALYZE: 'phase-analyze',
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-background/30">
      {/* HUD Info Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
        <div className="glass-panel p-5 flex flex-col gap-4 rounded-2xl">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-primary tracking-[0.2em] uppercase">Propagation Weight</span>
              <div className="flex items-center gap-3">
                <input type="range" min="0.1" max="1.0" step="0.1" value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value))}
                  className="w-24 h-1 accent-primary bg-white/10 rounded-full appearance-none cursor-pointer" />
                <span className="text-xs font-mono text-primary font-bold w-6">{weight.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase">Aggregator</span>
              <div className="flex gap-1 p-1 bg-black/40 rounded-xl">
                {(['SUM', 'MAX', 'MEAN'] as const).map(a => (
                  <button key={a} onClick={() => setAggregation(a)}
                    className={`px-3 py-1 text-[9px] font-bold rounded-lg transition-all ${aggregation === a ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-muted-foreground hover:text-foreground'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="glass-panel px-4 py-2 flex items-center gap-4 w-fit rounded-xl">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAnimating ? 'bg-neo-cyan' : 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-mono font-bold tracking-widest text-foreground/90 uppercase">{phaseLabel[phase]}</span>
          <div className="w-[1px] h-3 bg-white/10"></div>
          <span className="text-[10px] font-mono text-primary font-bold">L-{layer}</span>
        </div>
      </div>

      {/* Floating Action Bar (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <button onClick={handleReset}
          className="p-4 glass-panel text-muted-foreground rounded-2xl hover:text-primary transition-all group active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-700"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        
        <button onClick={runNextPhase} disabled={isAnimating}
          className={`flex items-center gap-4 px-10 py-4 font-bold uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl transition-all relative overflow-hidden group ${
            isAnimating 
              ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
              : 'bg-primary text-black hover:scale-105 active:scale-95 neo-glow-cyan'
          }`}>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10">{isAnimating ? 'Processing' : (phase === 'IDLE' ? 'Execute Protocol' : 'Next Step')}</span>
          {!isAnimating && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="m9 18 6-6-6-6"/></svg>
          )}
        </button>

        <button onClick={toggleAutoPlay}
          className={`px-8 py-4 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl border transition-all active:scale-95 ${
            isAutoPlaying 
              ? 'bg-neo-purple/20 text-neo-purple border-neo-purple/50 shadow-[0_0_20px_rgba(112,0,255,0.2)]' 
              : 'glass-panel text-muted-foreground border-white/10 hover:border-primary/50 hover:text-primary'
          }`}>
          {isAutoPlaying ? 'HALT AUTO' : 'AUTO SYNC'}
        </button>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden rounded-3xl m-4 border border-white/5 bg-black/40">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 2px 2px, hsla(180, 100%, 50%, 0.5) 1px, transparent 0)', 
               backgroundSize: '32px 32px' 
             }} />
        <canvas ref={canvasRef} className="absolute inset-0" />
        {tooltip && (
          <div
            className="fixed z-50 glass-panel rounded-2xl px-5 py-4 text-xs pointer-events-none animate-fade-in shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-primary/20"
            style={{
              left: tooltip.x + 20, top: tooltip.y + 20,
              maxWidth: 300,
            }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
      </div>
    </div>
  );
}

