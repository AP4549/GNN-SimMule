import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphVisualizer from '@/components/GraphVisualizer';
import AnalysisPanel from '@/components/AnalysisPanel';
import { SCENARIOS, TYPE_COLORS, CH_COLORS } from '@/data/scenarios';
import type { AnalysisData } from '@/components/GraphVisualizer';
import { Shield, Info, Layers, ChevronRight, Activity, Sun, Moon, X } from 'lucide-react';

const Index = () => {
  const [scenario, setScenario] = useState('muleRing');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col z-20">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center soft-shadow">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">SimMule</span>
              <span className="text-[11px] text-muted-foreground">Fraud Intelligence</span>
            </div>
          </div>

          <nav className="flex-1 space-y-8">
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground mb-3 tracking-wide px-1">Scenarios</h3>
              <div className="space-y-1.5">
                {Object.entries(SCENARIOS).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => { setScenario(key); setAnalysisData(null); }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between group font-medium rounded-xl transition-colors ${
                      key === scenario
                        ? 'bg-primary text-primary-foreground soft-shadow'
                        : 'bg-transparent text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="tracking-tight">{s.name}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${key === scenario ? 'text-primary-foreground translate-x-0.5' : 'text-muted-foreground/40 group-hover:translate-x-0.5'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground mb-3 tracking-wide px-1">Status</h3>
              <div className="space-y-2.5 px-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> System</span>
                  <span className="neo-green font-medium">Nominal</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2"><Layers className="w-3.5 h-3.5"/> GNN Engine</span>
                  <span className="text-primary font-medium">Active</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="pt-6 border-t border-border flex flex-col gap-4">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <p className="text-[11px] text-muted-foreground/70 text-center">© 2026 SimMule v1.0.4</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 bg-background">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{sc?.name}</h1>
            <div className="h-5 w-px bg-border" />
            <p className="text-sm text-muted-foreground max-w-md line-clamp-1">{sc?.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
            >
              <Info className="w-4 h-4" />
              Guide
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Main Visualizer Area */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Visualizer Container */}
            <div className="flex-1 bg-card border border-border rounded-3xl overflow-hidden relative group soft-shadow">
              <GraphVisualizer scenario={scenario} onAnalysis={handleAnalysis} />

              <AnimatePresence>
                {analysisData && (
                  <AnalysisPanel data={analysisData} onClose={() => setAnalysisData(null)} />
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Sidebar (Legend & Context) */}
            <aside className="w-80 flex flex-col gap-5 overflow-y-auto pr-1">
              <section className="bg-card border border-border rounded-2xl p-5 space-y-4 soft-shadow">
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2 tracking-wide">Network Context</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sc?.context}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-foreground mb-2 tracking-wide">Logic</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sc?.focusDesc}
                  </p>
                </div>
              </section>

              {/* Legend Section */}
              <section className="bg-card border border-border rounded-2xl p-5 space-y-5 soft-shadow">
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-3 tracking-wide">Entities</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(TYPE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                        <span className="text-foreground font-medium">{type}</span>
                        <div className="w-3.5 h-3.5 rounded-full ring-2 ring-background" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-foreground mb-3 tracking-wide">Channels</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(CH_COLORS).map(([ch, color]) => (
                      <div key={ch} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                        <span className="text-foreground font-medium">{ch}</span>
                        <div className="w-6 h-2 rounded-full" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-foreground mb-3 tracking-wide">Risk Levels</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Critical ≥ 8.0</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-destructive" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Suspicious ≥ 5.0</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-secondary" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Nominal &lt; 5.0</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-primary" />
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-foreground/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              className="w-full max-w-3xl bg-card p-10 relative overflow-hidden rounded-3xl soft-shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowGuide(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 space-y-8">
                <header className="border-b border-border pb-5">
                  <h2 className="text-2xl font-bold tracking-tight mb-1 text-foreground">How analysis works</h2>
                  <p className="text-sm text-muted-foreground">Neural network detection & forensic analysis protocol</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Message passing
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Traditional isolated analysis fails to capture networked fraud. Our GNN engine models risk at the edge, propagating signals through transaction topology to surface latent rings.
                      </p>
                    </section>

                    <div className="space-y-3">
                      {[
                        { step: '01', title: 'Generate', desc: 'Edge signals computed from source risk' },
                        { step: '02', title: 'Aggregate', desc: 'Node-level synthesis of incoming risk' },
                        { step: '03', title: 'Update', desc: 'Recalculation of entity risk profile' }
                      ].map(p => (
                        <div key={p.step} className="bg-muted/50 rounded-2xl p-4 flex gap-4 items-center">
                          <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold font-mono">{p.step}</span>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{p.title}</div>
                            <div className="text-xs text-muted-foreground">{p.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <section className="bg-muted/50 rounded-2xl p-5 border border-border">
                      <h3 className="text-sm font-semibold text-secondary mb-4">Mathematical core</h3>
                      <div className="space-y-3 font-mono text-[11px]">
                        <div className="p-3 rounded-xl bg-card border border-border">
                          <div className="text-muted-foreground mb-1">Message Kernel:</div>
                          <code className="text-secondary">m[i→j] = R[i] × M[ij] × W</code>
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                          <div className="text-muted-foreground mb-1">Aggregation:</div>
                          <code className="text-primary">A[j] = Σ m[i→j]</code>
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                          <div className="text-muted-foreground mb-1">Update Map:</div>
                          <code className="neo-green">R'[j] = clip(R[j] + A[j], 0, 10)</code>
                        </div>
                      </div>
                    </section>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      Propagation weight (W) and permutation-invariant aggregators (Σ) are configurable via the control bar.
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
