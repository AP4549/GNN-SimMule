# GNN-SimMule: Neural Intelligence Framework

A sophisticated Graph Neural Network (GNN) simulator designed for financial risk analysis, specifically focusing on the detection of "mule rings" and networked fraud patterns.

## Overview

GNN-SimMule leverages modern GNN architectures to model financial transactions as a graph topology. Unlike traditional linear analysis, it utilizes **Message Passing (GNN-MP)** to propagate risk signals through the network, exposing latent connections and surfacing clusters of suspicious activity.


<img width="1903" height="803" alt="image" src="https://github.com/user-attachments/assets/f49363e5-3a0e-4864-bc91-85861e813953" />
- Multiple Scenarios
<img width="1901" height="834" alt="image" src="https://github.com/user-attachments/assets/44fae534-6503-40f7-9fde-27d9fd6765f1" />
- Intuitive UX, Animated steps for clarity
<img width="1893" height="758" alt="image" src="https://github.com/user-attachments/assets/8e9c49a3-9468-4727-ac08-d7cf11375435" />
- Output after GNN processing 
<img width="1869" height="823" alt="image" src="https://github.com/user-attachments/assets/9e0407b1-5531-40e1-9492-0f4009936cb7" />

## Key Features

- **Neural Intelligence Engine**: Proprietary risk propagation logic (Generate, Aggregate, Update).
- **Interactive Graph Visualizer**: Real-time rendering of transaction networks with risk-based color grading.
- **Scenario Simulation**: Pre-configured analysis templates (e.g., `muleRing`) for different fraud topologies.
- **Premium Neo-Finance UI**: High-fidelity dark-themed interface with glassmorphism and fluid animations.
- **Intelligence Guide**: In-app educational framework explaining the mathematical core of GNN operations.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **Motion**: Framer Motion
- **Visualization**: Recharts, Custom Canvas Visualizers
- **Verification**: Vitest, Playwright

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (Optional, but recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/gnn-simmule.git
cd gnn-simmule

# Install dependencies
npm install
# OR
bun install
```

### Development

```bash
# Start development server
npm run dev
# OR
bun run dev
```

### Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the production bundle.
- `npm run test`: Run unit tests with Vitest.
- `npm run lint`: Lint the codebase.

## Operational Logic

The simulator follows a strict GNN protocol:
1. **GENERATE**: Edge signals are computed from source entity risk.
2. **AGGREGATE**: Node-level synthesis of incoming risk using permutation-invariant aggregators.
3. **UPDATE**: Recalculation of entity risk profiles based on aggregated signals.

---
*© 2026 Neo-Risk Lab - SimMule v1.0.4*
