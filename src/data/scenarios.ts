export interface ScenarioNode {
  id: string;
  label: string;
  type: 'Fraudster' | 'Mule' | 'Account' | 'Merchant' | 'Crypto' | 'PhishingAttack' | 'Insider';
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
  },
  phishing: {
    name: "Phishing Ring",
    description: "Coordinated phishing attack → credential compromise → account takeover → fund extraction.",
    context: "Real incident: INR 3.5Cr email phishing scam, 2023. 12 compromised accounts, coordinated SIM swaps.",
    focusNode: "phishOps",
    focusDesc: "Central phishing operation coordinates credential theft and account compromise",
    nodes: [
      { id: "phishOps", label: "Phishing Ops", type: "PhishingAttack", x: 350, y: 200, risk: 8.8, flow: "Out", velocity: "Extreme" },
      { id: "victim1", label: "Victim 1", type: "Account", x: 150, y: 80, risk: 6.2, flow: "Out", velocity: "High" },
      { id: "victim2", label: "Victim 2", type: "Account", x: 150, y: 180, risk: 5.9, flow: "Out", velocity: "High" },
      { id: "victim3", label: "Victim 3", type: "Account", x: 150, y: 280, risk: 6.5, flow: "Out", velocity: "High" },
      { id: "simSwap", label: "SIM Swap Expert", type: "Fraudster", x: 350, y: 380, risk: 8.3, flow: "In", velocity: "Extreme" },
      { id: "aggregator", label: "Fund Aggregator", type: "Mule", x: 550, y: 230, risk: 7.1, flow: "In/Out", velocity: "Extreme" },
      { id: "exfil", label: "Exfiltration", type: "Crypto", x: 750, y: 230, risk: 4.8, flow: "Out", velocity: "Abnormal" }
    ],
    edges: [
      { source: "phishOps", target: "victim1", channel: "UPI", amount: 125000, speed: "Instant", sharedIP: true, multiplier: 2.4 },
      { source: "phishOps", target: "victim2", channel: "UPI", amount: 98000, speed: "Instant", sharedIP: true, multiplier: 2.3 },
      { source: "phishOps", target: "victim3", channel: "IMPS", amount: 142000, speed: "Rapid", sharedIP: true, multiplier: 2.2 },
      { source: "phishOps", target: "simSwap", channel: "Hawala", amount: 35000, speed: "Standard", sharedIP: false, multiplier: 0.7 },
      { source: "victim1", target: "aggregator", channel: "UPI", amount: 115000, speed: "Instant", sharedIP: false, multiplier: 2.1 },
      { source: "victim2", target: "aggregator", channel: "IMPS", amount: 88000, speed: "Rapid", sharedIP: false, multiplier: 2.0 },
      { source: "victim3", target: "aggregator", channel: "UPI", amount: 130000, speed: "Instant", sharedIP: false, multiplier: 2.2 },
      { source: "simSwap", target: "aggregator", channel: "NEFT", amount: 32000, speed: "Standard", sharedIP: false, multiplier: 0.8 },
      { source: "aggregator", target: "exfil", channel: "Crypto", amount: 365000, speed: "Rapid", sharedIP: false, multiplier: 1.8 }
    ]
  },
  insiderTrading: {
    name: "Insider Trading",
    description: "Confidential information access → suspicious market orders → profit extraction via shell accounts.",
    context: "Real pattern: SEBI observations. Employee access to unpublished merger data → unusual options trading.",
    focusNode: "insider",
    focusDesc: "Insider employee exploits confidential information for unauthorized trading profits",
    nodes: [
      { id: "insider", label: "Insider Emp.", type: "Insider", x: 320, y: 200, risk: 8.6, flow: "Out", velocity: "Extreme" },
      { id: "dataSource", label: "Data Source", type: "Account", x: 120, y: 200, risk: 7.2, flow: "Out", velocity: "High" },
      { id: "shell1", label: "Shell A/C 1", type: "Account", x: 520, y: 100, risk: 5.8, flow: "In/Out", velocity: "Abnormal" },
      { id: "shell2", label: "Shell A/C 2", type: "Account", x: 520, y: 300, risk: 5.5, flow: "In/Out", velocity: "Abnormal" },
      { id: "broker", label: "Complicit Broker", type: "Fraudster", x: 320, y: 380, risk: 7.9, flow: "In/Out", velocity: "High" },
      { id: "optionsMkt", label: "Options Market", type: "Merchant", x: 720, y: 200, risk: 4.2, flow: "In", velocity: "Normal" },
      { id: "profitExit", label: "Profit Exit", type: "Crypto", x: 900, y: 200, risk: 5.3, flow: "Out", velocity: "Abnormal" }
    ],
    edges: [
      { source: "dataSource", target: "insider", channel: "UPI", amount: 25000, speed: "Instant", sharedIP: true, multiplier: 2.5 },
      { source: "insider", target: "shell1", channel: "IMPS", amount: 450000, speed: "Rapid", sharedIP: false, multiplier: 1.9 },
      { source: "insider", target: "shell2", channel: "UPI", amount: 380000, speed: "Instant", sharedIP: false, multiplier: 2.0 },
      { source: "insider", target: "broker", channel: "NEFT", amount: 50000, speed: "Standard", sharedIP: false, multiplier: 0.9 },
      { source: "shell1", target: "optionsMkt", channel: "UPI", amount: 420000, speed: "Instant", sharedIP: false, multiplier: 2.1 },
      { source: "shell2", target: "optionsMkt", channel: "IMPS", amount: 350000, speed: "Rapid", sharedIP: false, multiplier: 2.0 },
      { source: "broker", target: "optionsMkt", channel: "NEFT", amount: 45000, speed: "Standard", sharedIP: false, multiplier: 0.8 },
      { source: "optionsMkt", target: "profitExit", channel: "Crypto", amount: 780000, speed: "Rapid", sharedIP: false, multiplier: 1.7 }
    ]
  }
};

export const TYPE_COLORS: Record<string, string> = {
  Fraudster: '#E85D75',
  Mule: '#8B6BC4',
  Account: '#4DB8D8',
  Merchant: '#5B7FB5',
  Crypto: '#5FA85F',
  PhishingAttack: '#D4824F',
  Insider: '#7A6BA8'
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
