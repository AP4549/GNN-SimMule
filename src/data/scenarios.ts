export interface ScenarioNode {
  id: string;
  label: string;
  type: 'Fraudster' | 'Mule' | 'Account' | 'Merchant' | 'Crypto';
  x: number;
  y: number;
  risk: number;
  flow: string;
  velocity: string;
}

export interface ScenarioEdge {
  source: string;
  target: string;
  channel: string;
  amount: number;
  speed: string;
  sharedIP: boolean;
  multiplier: number;
}

export interface Scenario {
  name: string;
  description: string;
  context: string;
  focusNode: string;
  focusDesc: string;
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
}

export const SCENARIOS: Record<string, Scenario> = {
  muleRing: {
    name: "Mule Ring Hub",
    description: "Hub-and-spoke structure. Central mule account receives from multiple scammers and disperses to couriers.",
    context: "Real incident: INR 8.2Cr Jamtara scam network (2022). 47 mule accounts coordinated by 3 hub nodes.",
    focusNode: "hub1",
    focusDesc: "Central mule hub aggregates stolen funds from scammer network",
    nodes: [
      { id: "hub1", label: "Mule Hub", type: "Mule", x: 400, y: 250, risk: 7.2, flow: "Out", velocity: "Extreme" },
      { id: "scammer1", label: "Scammer A", type: "Fraudster", x: 180, y: 120, risk: 8.5, flow: "Out", velocity: "High" },
      { id: "scammer2", label: "Scammer B", type: "Fraudster", x: 180, y: 380, risk: 7.8, flow: "Out", velocity: "High" },
      { id: "courier1", label: "Courier 1", type: "Mule", x: 620, y: 120, risk: 4.1, flow: "In", velocity: "Normal" },
      { id: "courier2", label: "Courier 2", type: "Mule", x: 620, y: 380, risk: 3.8, flow: "In", velocity: "Normal" },
      { id: "exit1", label: "Exit Point", type: "Crypto", x: 800, y: 250, risk: 5.5, flow: "Out", velocity: "Abnormal" }
    ],
    edges: [
      { source: "scammer1", target: "hub1", channel: "UPI", amount: 145000, speed: "Instant", sharedIP: true, multiplier: 2.2 },
      { source: "scammer2", target: "hub1", channel: "IMPS", amount: 89000, speed: "Rapid", sharedIP: true, multiplier: 1.8 },
      { source: "hub1", target: "courier1", channel: "NEFT", amount: 95000, speed: "Standard", sharedIP: false, multiplier: 0.7 },
      { source: "hub1", target: "courier2", channel: "UPI", amount: 78000, speed: "Instant", sharedIP: false, multiplier: 2.0 },
      { source: "hub1", target: "exit1", channel: "Crypto", amount: 210000, speed: "Rapid", sharedIP: false, multiplier: 1.6 },
      { source: "courier1", target: "exit1", channel: "Hawala", amount: 55000, speed: "Standard", sharedIP: false, multiplier: 0.6 },
      { source: "courier2", target: "exit1", channel: "NEFT", amount: 48000, speed: "Standard", sharedIP: false, multiplier: 0.5 }
    ]
  },
  smurfing: {
    name: "Smurfing Chain",
    description: "Below-threshold transaction structuring. Many feeders → collector → bridges → exit point.",
    context: "Real pattern: INR 49,999 repeat transactions to stay under INR 50K reporting threshold.",
    focusNode: "collector",
    focusDesc: "Collector node aggregates just-below-threshold transactions from multiple feeders",
    nodes: [
      { id: "feeder1", label: "Feeder 1", type: "Account", x: 150, y: 150, risk: 5.2, flow: "Out", velocity: "High" },
      { id: "feeder2", label: "Feeder 2", type: "Account", x: 150, y: 300, risk: 4.8, flow: "Out", velocity: "High" },
      { id: "feeder3", label: "Feeder 3", type: "Account", x: 150, y: 450, risk: 5.5, flow: "Out", velocity: "High" },
      { id: "collector", label: "Collector", type: "Mule", x: 380, y: 300, risk: 6.8, flow: "In", velocity: "Extreme" },
      { id: "bridge1", label: "Bridge 1", type: "Account", x: 590, y: 200, risk: 3.5, flow: "In/Out", velocity: "Normal" },
      { id: "exit", label: "Exit", type: "Crypto", x: 780, y: 300, risk: 4.2, flow: "Out", velocity: "Abnormal" }
    ],
    edges: [
      { source: "feeder1", target: "collector", channel: "UPI", amount: 49999, speed: "Instant", sharedIP: false, multiplier: 2.1 },
      { source: "feeder2", target: "collector", channel: "UPI", amount: 49999, speed: "Instant", sharedIP: false, multiplier: 2.1 },
      { source: "feeder3", target: "collector", channel: "IMPS", amount: 49500, speed: "Rapid", sharedIP: true, multiplier: 1.9 },
      { source: "collector", target: "bridge1", channel: "NEFT", amount: 120000, speed: "Standard", sharedIP: false, multiplier: 0.6 },
      { source: "bridge1", target: "exit", channel: "Crypto", amount: 105000, speed: "Rapid", sharedIP: false, multiplier: 1.5 },
      { source: "collector", target: "exit", channel: "Hawala", amount: 28000, speed: "Standard", sharedIP: false, multiplier: 0.5 }
    ]
  },
  bustOut: {
    name: "Bust-Out Loop",
    description: "Credit build-up via circular payments among ring members, then rapid extraction via loans.",
    context: "Real incident: INR 12Cr credit card bust-out, Maharashtra 2023. 8 linked entities, circular float.",
    focusNode: "creditA",
    focusDesc: "creditA builds credit score via circular flows, then extracts via loan",
    nodes: [
      { id: "creditA", label: "Credit A", type: "Account", x: 280, y: 180, risk: 6.5, flow: "In/Out", velocity: "High" },
      { id: "creditB", label: "Credit B", type: "Account", x: 520, y: 180, risk: 6.1, flow: "In/Out", velocity: "High" },
      { id: "creditC", label: "Credit C", type: "Account", x: 400, y: 380, risk: 5.8, flow: "In/Out", velocity: "High" },
      { id: "loanDrain", label: "Loan Drain", type: "Fraudster", x: 160, y: 350, risk: 8.2, flow: "Out", velocity: "Extreme" },
      { id: "merchant1", label: "Ghost Merchant", type: "Merchant", x: 640, y: 350, risk: 7.0, flow: "In", velocity: "Abnormal" }
    ],
    edges: [
      { source: "creditA", target: "creditB", channel: "UPI", amount: 85000, speed: "Instant", sharedIP: true, multiplier: 2.3 },
      { source: "creditB", target: "creditC", channel: "UPI", amount: 82000, speed: "Instant", sharedIP: true, multiplier: 2.3 },
      { source: "creditC", target: "creditA", channel: "UPI", amount: 78000, speed: "Instant", sharedIP: true, multiplier: 2.3 },
      { source: "creditA", target: "loanDrain", channel: "IMPS", amount: 250000, speed: "Rapid", sharedIP: false, multiplier: 1.7 },
      { source: "creditB", target: "merchant1", channel: "UPI", amount: 180000, speed: "Instant", sharedIP: false, multiplier: 2.0 },
      { source: "merchant1", target: "loanDrain", channel: "NEFT", amount: 160000, speed: "Standard", sharedIP: false, multiplier: 0.8 }
    ]
  },
  crossBorder: {
    name: "Cross-Border Mule",
    description: "International layering through crypto exchanges, hawala intermediaries, forex conversions.",
    context: "Real pattern: INR 45Cr FEMA violation, 2023. UAE hawala network → Singapore crypto → India repatriation.",
    focusNode: "hawalaBroker",
    focusDesc: "Hawala broker facilitates cross-border movement beyond regulatory oversight",
    nodes: [
      { id: "domesticSource", label: "Domestic Src", type: "Account", x: 130, y: 250, risk: 6.0, flow: "Out", velocity: "High" },
      { id: "hawalaBroker", label: "Hawala Broker", type: "Fraudster", x: 330, y: 180, risk: 8.5, flow: "In/Out", velocity: "Extreme" },
      { id: "cryptoExchange", label: "Crypto Exch.", type: "Crypto", x: 550, y: 120, risk: 5.5, flow: "In/Out", velocity: "Abnormal" },
      { id: "forexAgent", label: "Forex Agent", type: "Account", x: 550, y: 380, risk: 4.8, flow: "In/Out", velocity: "Normal" },
      { id: "offshoreBank", label: "Offshore Bank", type: "Fraudster", x: 750, y: 250, risk: 7.2, flow: "In", velocity: "High" }
    ],
    edges: [
      { source: "domesticSource", target: "hawalaBroker", channel: "Hawala", amount: 850000, speed: "Standard", sharedIP: false, multiplier: 0.8 },
      { source: "hawalaBroker", target: "cryptoExchange", channel: "Crypto", amount: 720000, speed: "Rapid", sharedIP: false, multiplier: 1.7 },
      { source: "hawalaBroker", target: "forexAgent", channel: "NEFT", amount: 180000, speed: "Standard", sharedIP: false, multiplier: 0.6 },
      { source: "cryptoExchange", target: "offshoreBank", channel: "Crypto", amount: 690000, speed: "Rapid", sharedIP: false, multiplier: 1.9 },
      { source: "forexAgent", target: "offshoreBank", channel: "NEFT", amount: 165000, speed: "Standard", sharedIP: false, multiplier: 0.7 },
      { source: "offshoreBank", target: "domesticSource", channel: "Hawala", amount: 810000, speed: "Standard", sharedIP: true, multiplier: 1.5 }
    ]
  },
  layering: {
    name: "Layering Network",
    description: "5-7 hop transaction chain with circular trades and channel switching to obscure source.",
    context: "Real pattern: AML typology TR-47. Funds pass through 6+ hops with channel switches every 2 hops.",
    focusNode: "layer3",
    focusDesc: "Middle layer node is the convergence point of multiple layering chains",
    nodes: [
      { id: "source", label: "Origin", type: "Fraudster", x: 120, y: 250, risk: 8.0, flow: "Out", velocity: "Extreme" },
      { id: "layer1", label: "Layer 1", type: "Account", x: 280, y: 150, risk: 4.5, flow: "In/Out", velocity: "High" },
      { id: "layer2", label: "Layer 2", type: "Account", x: 280, y: 350, risk: 4.2, flow: "In/Out", velocity: "High" },
      { id: "layer3", label: "Layer 3", type: "Mule", x: 460, y: 250, risk: 5.8, flow: "In/Out", velocity: "Abnormal" },
      { id: "layer4", label: "Layer 4", type: "Account", x: 640, y: 180, risk: 3.5, flow: "In/Out", velocity: "Normal" },
      { id: "finalDest", label: "Final Dest.", type: "Crypto", x: 790, y: 300, risk: 5.0, flow: "Out", velocity: "Abnormal" }
    ],
    edges: [
      { source: "source", target: "layer1", channel: "UPI", amount: 320000, speed: "Instant", sharedIP: true, multiplier: 2.2 },
      { source: "source", target: "layer2", channel: "IMPS", amount: 280000, speed: "Rapid", sharedIP: false, multiplier: 1.8 },
      { source: "layer1", target: "layer3", channel: "NEFT", amount: 295000, speed: "Standard", sharedIP: false, multiplier: 0.7 },
      { source: "layer2", target: "layer3", channel: "Hawala", amount: 260000, speed: "Standard", sharedIP: false, multiplier: 0.9 },
      { source: "layer3", target: "layer4", channel: "Crypto", amount: 480000, speed: "Rapid", sharedIP: false, multiplier: 1.6 },
      { source: "layer4", target: "finalDest", channel: "UPI", amount: 450000, speed: "Instant", sharedIP: false, multiplier: 2.0 },
      { source: "layer3", target: "finalDest", channel: "Crypto", amount: 55000, speed: "Rapid", sharedIP: false, multiplier: 1.5 }
    ]
  }
};

export const TYPE_COLORS: Record<string, string> = {
  Fraudster: '#E85D75',
  Mule: '#8B6BC4',
  Account: '#4DB8D8',
  Merchant: '#5B7FB5',
  Crypto: '#5FA85F'
};

export const CH_COLORS: Record<string, string> = {
  UPI: '#4DB8D8',
  NEFT: '#5FA85F',
  IMPS: '#8B6BC4',
  Crypto: '#E85D75',
  Hawala: '#D4824F'
};

export function getRiskColor(r: number): string {
  if (r >= 8) return '#E85D75';
  if (r >= 5) return '#8B6BC4';
  if (r >= 3) return '#5B7FB5';
  return '#5FA85F';
}

export function fmtINR(n: number): string {
  n = Math.floor(n);
  if (n < 1000) return '₹' + n;
  const s = String(n);
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const chunks: string[] = [];
  while (rest.length > 2) { chunks.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
  if (rest) chunks.unshift(rest);
  return '₹' + chunks.join(',') + ',' + last3;
}
