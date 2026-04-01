import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphVisualizer from '@/components/GraphVisualizer';
import AnalysisPanel from '@/components/AnalysisPanel';
import { SCENARIOS, TYPE_COLORS, CH_COLORS, fmtINR } from '@/data/scenarios';
import type { AnalysisData } from '@/components/GraphVisualizer';
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
    <div className={`min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-hidden ${darkMode ? 'dark' : 'light'}`}>
      {/* Neo-Brutalism Sidebar */}
      <aside className="w-64 bg-background border-r-4 border-border flex flex-col z-20">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary border-4 border-border flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-widest text-foreground uppercase" style={{ fontFamily: 'Quantico, sans-serif' }}>SYSTEM</span>
              <span className="text-[10px] text-foreground font-mono uppercase tracking-widest font-bold">CORRUPT</span>
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
                    className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between group font-bold border-4 uppercase transition-none ${
                      key === scenario
                        ? 'bg-primary text-primary-foreground border-border'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    <span className="tracking-tight">{s.name}</span>
                    <Zap className={`w-3 h-3 transition-transform duration-500 ${key === scenario ? 'text-primary scale-110' : 'text-muted-foreground/30 group-hover:text-primary'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-[10px] font-mono text-muted-foreground mb-4 uppercase tracking-[0.2em]">Status</h3>
              <div className="space-y-3 px-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-3 h-3"/> System</span>
                  <span className="neo-green font-mono">NOMINAL</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-2"><Layers className="w-3 h-3"/> GNN Engine</span>
                  <span className="text-primary font-mono">ACTIVE</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="pt-6 border-t-4 border-border flex flex-col gap-4">
             <button
                onClick={() => setDarkMode((v) => !v)}
                className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase border-4 border-border bg-primary text-primary-foreground hover:bg-secondary transition-none"
              >
                {darkMode ? '█ DARK' : '█ LIGHT'}
              </button>
            <p className="text-[10px] text-muted-foreground/50 font-mono text-center">© 2026 SimMule v1.0.4</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 bg-background">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b-4 border-border bg-background">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-widest text-foreground uppercase" style={{ fontFamily: 'Quantico, sans-serif', fontSize: '1.25rem' }}>DETECT {sc?.name}</h1>
            <div className="h-4 w-1 bg-border" />
            <p className="text-xs text-foreground max-w-md line-clamp-1">{sc?.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-background border-4 border-border text-foreground hover:bg-primary transition-none"
            >
              <Info className="w-3 h-3" />
              GUIDE
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Main Visualizer Area */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Visualizer Container */}
            <div className="flex-1 bg-background border-4 border-border overflow-hidden relative group">
              <GraphVisualizer scenario={scenario} onAnalysis={handleAnalysis} />
              
              <AnimatePresence>
                {analysisData && (
                  <AnalysisPanel data={analysisData} onClose={() => setAnalysisData(null)} />
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Sidebar (Legend & Context) */}
            <aside className="w-80 flex flex-col gap-6 overflow-y-auto pr-2">
              <section className="bg-background border-4 border-border p-5 space-y-4">
                <div>
                  <h3 className="text-[10px] font-mono text-foreground mb-3 uppercase tracking-widest font-bold">NETWORK CONTEXT</h3>
                  <p className="text-xs text-foreground leading-relaxed font-body">
                    {sc?.context}
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-border">
                   <h3 className="text-[10px] font-mono text-foreground mb-3 uppercase tracking-widest font-bold">LOGIC</h3>
                   <p className="text-[11px] text-foreground leading-relaxed">
                    {sc?.focusDesc}
                  </p>
                </div>
              </section>

              {/* Legend Section */}
              <section className="bg-background border-4 border-border p-5 space-y-5">
                <div>
                  <h3 className="text-[10px] font-mono text-foreground mb-3 uppercase tracking-widest font-bold">ENTITIES</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(TYPE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center justify-between text-[11px] bg-background border-2 border-border px-3 py-2">
                        <span className="text-foreground font-medium">{type}</span>
                        <div className="w-3 h-3 border-2 border-border" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-border">
                  <h3 className="text-[10px] font-mono text-foreground mb-3 uppercase tracking-widest font-bold">CHANNELS</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(CH_COLORS).map(([ch, color]) => (
                      <div key={ch} className="flex items-center justify-between text-[11px] bg-background border-2 border-border px-3 py-2">
                        <span className="text-foreground font-medium">{ch}</span>
                        <div className="w-6 h-2 border-2 border-border" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-border">
                  <h3 className="text-[10px] font-mono text-foreground mb-3 uppercase tracking-widest font-bold">RISK LEVELS</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-foreground font-medium">CRITICAL ≥ 8.0</span>
                      <div className="w-3 h-3 border-2 border-border bg-destructive" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-foreground font-medium">SUSPICIOUS ≥ 5.0</span>
                      <div className="w-3 h-3 border-2 border-border bg-secondary" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-foreground font-medium">NOMINAL &lt; 5.0</span>
                      <div className="w-3 h-3 border-2 border-border bg-primary" />
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-foreground/20"
            onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-3xl bg-background p-10 relative overflow-hidden border-4 border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-2xl font-light">×</span>
                </button>
              </div>

              <div className="relative z-10 space-y-8">
                <header className="border-b-4 border-border pb-4">
                  <h2 className="text-2xl font-bold tracking-widest mb-2 text-foreground uppercase" style={{ fontFamily: 'Quantico, sans-serif' }}>SYSTEM ANALYZE</h2>
                  <p className="text-sm text-foreground">Neural Network Detection & Forensic Analysis Protocol</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <section>
                      <h3 className="text-xs font-mono text-foreground mb-3 uppercase tracking-widest flex items-center gap-2 font-bold">
                        <Activity className="w-4 h-4" /> MESSAGE PASSING
                      </h3>
                      <p className="text-xs text-foreground leading-relaxed font-body">
                        Traditional isolationist analysis fails to capture networked fraud. Our GNN-MP engine models risk at the edge, propagating signals through transaction topology to surface latent rings.
                      </p>
                    </section>
                    
                    <div className="space-y-3">
                      {[
                        { step: '01', title: 'GENERATE', desc: 'Edge signals computed from source risk' },
                        { step: '02', title: 'AGGREGATE', desc: 'Node-level synthesis of incoming risk' },
                        { step: '03', title: 'UPDATE', desc: 'Recalculation of entity risk profile' }
                      ].map(p => (
                        <div key={p.step} className="bg-background p-3 flex gap-4 items-center border-3 border-border">
                          <span className="text-lg font-bold font-mono text-foreground">{p.step}</span>
                          <div>
                            <div className="text-[10px] font-bold text-foreground uppercase">{p.title}</div>
                            <div className="text-[10px] text-foreground">{p.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <section className="glass-card p-5 rounded-xl border-2 border-primary/30">
                      <h3 className="text-xs font-mono text-secondary mb-3 uppercase tracking-widest font-bold">Mathematical Core</h3>
                      <div className="space-y-4 font-mono text-[10px]">
                        <div className="p-2 rounded border-2 border-border bg-muted/10">
                          <div className="text-muted-foreground mb-1">Message Kernel:</div>
                          <code className="text-secondary">m[i→j] = R[i] × M[ij] × W</code>
                        </div>
                        <div className="p-2 rounded border-2 border-border bg-muted/10">
                          <div className="text-muted-foreground mb-1">Aggregation:</div>
                          <code className="text-primary">A[j] = Σ m[i→j]</code>
                        </div>
                        <div className="p-2 rounded border-2 border-border bg-muted/10">
                          <div className="text-muted-foreground mb-1">Update Map:</div>
                          <code className="neo-green">R'[j] = clip(R[j] + A[j], 0, 10)</code>
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
