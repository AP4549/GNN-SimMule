import { motion } from 'framer-motion';
import type { AnalysisData } from './GraphVisualizer';
import { TYPE_COLORS, CH_COLORS, getRiskColor, SCENARIOS } from '@/data/scenarios';
import { TrendingUp, User, Activity, X } from 'lucide-react';

interface AnalysisPanelProps {
  data: AnalysisData;
  onClose: () => void;
}

export default function AnalysisPanel({ data, onClose }: AnalysisPanelProps) {
  const { sorted, topSuspect, focusNode, drivers, riskHistory, layer, focusNodeId } = data;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 35, stiffness: 350 }}
      className="absolute right-0 top-0 bottom-0 w-85 glass-panel border-l-2 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b-2 border-border">
        <div className="flex flex-col">
          <h3 className="font-display text-sm tracking-widest text-shadow-cyan flex items-center gap-2 font-bold">
            <Activity className="w-4 h-4 text-primary" /> INTELLIGENCE REPORT
          </h3>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Sequence Layer 0{layer}</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary/10 transition-colors group border border-border">
          <X className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* Rankings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold">Network Rankings</h4>
            <span className="text-[10px] font-mono text-muted-foreground">{sorted.length} ENTITIES</span>
          </div>
          <div className="glass-card rounded-lg overflow-hidden border-2 border-border">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted/20 text-muted-foreground border-b-2 border-border">
                  <th className="py-2.5 px-4 text-left font-mono font-bold">#</th>
                  <th className="py-2.5 px-4 text-left font-mono font-bold">ID</th>
                  <th className="py-2.5 px-4 text-right font-mono font-bold">RISK</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((n, i) => {
                  const hist = riskHistory[n.id] || [];
                  const last = hist[hist.length - 2];
                  const current = n.currentRisk;
                  const delta = (last !== undefined) ? current - last : 0;
                  const riskColor = current >= 8 ? 'hsl(var(--destructive))' : current >= 5 ? 'hsl(var(--secondary))' : 'hsl(var(--primary))';
                  
                  return (
                    <tr key={n.id} className="border-t border-border hover:bg-primary/5 transition-colors group">
                      <td className="py-3 px-4 text-muted-foreground font-mono font-medium">{i + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{n.label}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-tighter" style={{ color: TYPE_COLORS[n.type] }}>{n.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold" style={{ color: riskColor }}>
                            {current.toFixed(1)}
                          </span>
                          {delta !== 0 && (
                            <span className={`text-[8px] font-mono font-bold ${delta > 0 ? 'neo-pink' : 'neo-green'}`}>
                              {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Suspect Card */}
        {topSuspect && (
          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[10px] uppercase tracking-widest neo-pink font-bold mb-3 flex items-center gap-2">
              <User className="w-3 h-3" /> Critical Threat
            </h4>
            <div className="glass-panel p-5 rounded-lg border-2 border-destructive/30 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-lg font-bold tracking-tighter">{topSuspect.label}</span>
                <div className="flex flex-col items-end">
                   <span className="text-2xl font-black font-mono neo-pink text-shadow-pink leading-none">
                    {topSuspect.currentRisk.toFixed(1)}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase mt-1">RISK SCORE</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 relative z-10">
                <span className="text-[9px] px-3 py-1 rounded-lg font-bold uppercase tracking-widest border-2 border-destructive/30 neo-pink bg-destructive/10">
                  {topSuspect.type}
                </span>
                <div className="px-3 py-1 rounded-lg glass-card border-2 border-border text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> VOL: {topSuspect.velocity}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Drivers */}
        {focusNode && drivers.length > 0 && (
          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Vector Analysis
            </h4>
            <div className="space-y-3">
              {drivers.map((d, i) => (
                <div key={i} className="glass-card p-4 rounded-lg border-2 border-border group hover:border-primary/40 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{d.srcNode?.label || d.edge.source}</span>
                    <span className="text-xs font-mono font-bold text-primary">+{d.contrib.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden border border-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (d.contrib / 10) * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary to-primary/40 rounded-full shadow-lg" 
                      />
                    </div>
                    <span className="text-[9px] font-mono uppercase font-bold tracking-tighter" style={{ color: CH_COLORS[d.edge.channel] }}>{d.edge.channel}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Risk Trend */}
        {layer > 0 && riskHistory[focusNodeId] && riskHistory[focusNodeId].length >= 2 && (
          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">Risk Variance Trend</h4>
            <TrendChart data={riskHistory[focusNodeId]} />
          </section>
        )}
      </div>
    </motion.div>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const W = 300, H = 140, pl = 30, pr = 10, pt = 10, pb = 25;
  const iw = W - pl - pr, ih = H - pt - pb;
  const pts = data.map((v, i) => ({
    x: pl + (data.length < 2 ? iw / 2 : (i / (data.length - 1)) * iw),
    y: pt + ih - (v / 10) * ih,
    v
  }));

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], curr = pts[i];
    const cx1 = prev.x + (curr.x - prev.x) / 2;
    path += ` C ${cx1} ${prev.y}, ${cx1} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return (
    <div className="glass-card p-4 rounded-lg border-2 border-border">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(188, 50%, 53%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(188, 50%, 53%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path d={`${path} L ${pts[pts.length-1].x} ${pt + ih} L ${pts[0].x} ${pt + ih} Z`} fill="url(#chartGradient)" />

        {/* Grid lines */}
        {[0, 5, 10].map(v => {
          const y = pt + ih - (v / 10) * ih;
          const isDark = document.documentElement.classList.contains('dark');
          const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
          const textColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
          return <g key={v}>
            <line x1={pl} y1={y} x2={W - pr} y2={y} stroke={gridColor} strokeWidth="1" />
            <text x={pl - 8} y={y + 3} fill={textColor} fontSize="8" font-family="JetBrains Mono" textAnchor="end">{v}</text>
          </g>;
        })}

        {/* Axis Labels */}
        {pts.map((p, i) => {
          const isDark = document.documentElement.classList.contains('dark');
          const labelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
          return (
            <text key={i} x={p.x} y={H - 5} fill={labelColor} fontSize="8" font-family="JetBrains Mono" textAnchor="middle">L{i}</text>
          );
        })}

        {/* The Line */}
        <path d={path} fill="none" stroke="hsl(188, 50%, 53%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {pts.map((p, i) => {
          const isDark = document.documentElement.classList.contains('dark');
          const textColor = isDark ? '#ffffff' : '#000000';
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="hsl(188, 50%, 53%)" style={{ filter: 'drop-shadow(0 0 5px hsl(188, 50%, 53%))' }} />
              <text x={p.x} y={p.y - 10} fill={textColor} fontSize="9" fontWeight="bold" font-family="JetBrains Mono" textAnchor="middle">{p.v.toFixed(1)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
