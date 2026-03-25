import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphVisualizer from '@/components/GraphVisualizer';
import AnalysisPanel from '@/components/AnalysisPanel';
import { SCENARIOS, TYPE_COLORS, CH_COLORS, fmtINR } from '@/data/scenarios';
import type { AnalysisData } from '@/components/GraphVisualizer';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Shield, Info, Layers, Zap, Activity } from 'lucide-react';

const Index = () => {
  const [scenario, setScenario] = useState('muleRing');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleAnalysis = useCallback((data: AnalysisData | null) => {
    setAnalysisData(data);
  }, []);

  const sc = SCENARIOS[scenario];

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-hidden">
      {/* Premium Sidebar */}
      <aside className="w-64 glass-panel border-r-0 flex flex-col z-20">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tighter text-shadow-cyan">NEO RISK LAB</span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">GNN SIMULATOR</span>
            </div>
          </div>

          <nav className="flex-1 space-y-6">
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground mb-4 uppercase tracking-[0.2em]">Scenarios</h3>
              <div className="space-y-1">
                {Object.entries(SCENARIOS).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => { setScenario(key); setAnalysisData(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all duration-300 flex items-center justify-between group ${
                      key === scenario
                        ? 'bg-primary/10 text-primary border border-primary/20 neo-glow-cyan'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <span className="font-medium tracking-tight">{s.name}</span>
                    <Zap className={`w-3 h-3 transition-transform duration-500 ${key === scenario ? 'text-primary scale-110' : 'text-muted-foreground/30 group-hover:text-primary'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-mono text-muted-foreground mb-4 uppercase tracking-[0.2em]">Status</h3>
              <div className="space-y-3 px-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-3 h-3"/> System</span>
                  <span className="text-neo-green font-mono">NOMINAL</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-2"><Layers className="w-3 h-3"/> GNN Engine</span>
                  <span className="text-primary font-mono">ACTIVE</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
             <LiquidButton
                size="sm"
                variant="default"
                onClick={() => setDarkMode((v) => !v)}
                className="w-full text-[10px] font-bold tracking-widest uppercase"
              >
                {darkMode ? 'DARK PROTOCOL' : 'LIGHT PROTOCOL'}
              </LiquidButton>
            <p className="text-[10px] text-muted-foreground/50 font-mono text-center">© 2026 SimMule v1.0.4</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tighter text-shadow-cyan">{sc?.name}</h1>
            <div className="h-4 w-[1px] bg-white/10" />
            <p className="text-xs text-muted-foreground max-w-md line-clamp-1">{sc?.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest glass-card text-primary border-primary/20 hover:border-primary/50 transition-all"
            >
              <Info className="w-3 h-3" />
              Intelligence Guide
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Main Visualizer Area */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Visualizer Container */}
            <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <GraphVisualizer scenario={scenario} onAnalysis={handleAnalysis} />
              
              <AnimatePresence>
                {analysisData && (
                  <AnalysisPanel data={analysisData} onClose={() => setAnalysisData(null)} />
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Sidebar (Legend & Context) */}
            <aside className="w-80 flex flex-col gap-6 overflow-y-auto pr-2">
              <section className="glass-card rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-[10px] font-mono text-primary mb-3 uppercase tracking-[0.2em]">Network Context</h3>
                  <p className="text-xs text-foreground/80 leading-relaxed font-body">
                    {sc?.context}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <h3 className="text-[10px] font-mono text-primary mb-3 uppercase tracking-[0.2em]">Operational Logic</h3>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    {sc?.focusDesc}
                  </p>
                </div>
              </section>

              {/* Legend Section */}
              <section className="glass-card rounded-2xl p-5 space-y-5">
                <div>
                  <h3 className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-[0.2em]">Entities</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(TYPE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center justify-between text-[11px] glass-panel bg-white/5 border-0 px-3 py-2 rounded-lg">
                        <span className="text-foreground/80">{type}</span>
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: color, color: color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-[0.2em]">Channels</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(CH_COLORS).map(([ch, color]) => (
                      <div key={ch} className="flex items-center justify-between text-[11px] glass-panel bg-white/5 border-0 px-3 py-2 rounded-lg">
                        <span className="text-foreground/80">{ch}</span>
                        <div className="w-6 h-1 rounded-full opacity-80" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-[0.2em]">Risk Grading</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">CRITICAL (≥ 8.0)</span>
                      <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_10px_#ef4444]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">SUSPICIOUS (≥ 5.0)</span>
                      <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_#7000ff]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">NOMINAL (&lt; 5.0)</span>
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#00f2ff]" />
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-3xl glass-panel rounded-3xl p-10 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-2xl font-light">×</span>
                </button>
              </div>

              <div className="relative z-10 space-y-8">
                <header>
                  <h2 className="text-2xl font-bold tracking-tighter mb-2 text-shadow-cyan">Neural Intelligence Framework</h2>
                  <p className="text-sm text-muted-foreground">Graph Neural Network Protocol for Financial Risk Analysis</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <section>
                      <h3 className="text-xs font-mono text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Message Passing
                      </h3>
                      <p className="text-xs text-foreground/70 leading-relaxed font-body">
                        Traditional isolationist analysis fails to capture networked fraud. Our GNN-MP engine models risk at the edge, propagating signals through transaction topology to surface latent rings.
                      </p>
                    </section>
                    
                    <div className="space-y-3">
                      {[
                        { step: '01', title: 'GENERATE', desc: 'Edge signals computed from source risk' },
                        { step: '02', title: 'AGGREGATE', desc: 'Node-level synthesis of incoming risk' },
                        { step: '03', title: 'UPDATE', desc: 'Recalculation of entity risk profile' }
                      ].map(p => (
                        <div key={p.step} className="glass-card p-3 rounded-xl flex gap-4 items-center">
                          <span className="text-lg font-bold font-mono text-white/10">{p.step}</span>
                          <div>
                            <div className="text-[10px] font-bold text-primary">{p.title}</div>
                            <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <section className="glass-card p-5 rounded-2xl bg-primary/5 border-primary/20">
                      <h3 className="text-xs font-mono text-secondary mb-3 uppercase tracking-widest">Mathematical Core</h3>
                      <div className="space-y-4 font-mono text-[10px]">
                        <div className="p-2 bg-black/40 rounded border border-white/5">
                          <div className="text-muted-foreground mb-1">Message Kernel:</div>
                          <code className="text-secondary">m[i→j] = R[i] × M[ij] × W</code>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5">
                          <div className="text-muted-foreground mb-1">Aggregation:</div>
                          <code className="text-primary">A[j] = Σ m[i→j]</code>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5">
                          <div className="text-muted-foreground mb-1">Update Map:</div>
                          <code className="text-neo-green">R'[j] = clip(R[j] + A[j], 0, 10)</code>
                        </div>
                      </div>
                    </section>
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                      *Propagation weight (W) and permutation-invariant aggregators (Σ) are configurable via the command HUD.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
